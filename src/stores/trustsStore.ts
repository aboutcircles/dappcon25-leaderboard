import { create } from 'zustand';
import { subscribeToTrusts, Trust } from '@/lib/envio/trusts';
import { usePlayersStore } from '@/stores/playersStore';
import { TopPlayer, TrustsStats } from '@/types';
import { getProfiles } from '@/lib/getProfiles';
import getTrustInits from '@/lib/nethermindIndexer/trustInits';

interface TrustsStore {
  stats: Record<string, TrustsStats>;
  loading: boolean;
  error: string | null;
  top10: TopPlayer[];
  scores: TopPlayer[];

  trustMap: Record<string, { in: string[]; out: string[]; mutual: string[] }>;

  fetchStats: () => Promise<void>;
  subscribeToStats: (playerAddresses: string[]) => { unsubscribe: () => void };
}

export const useTrustsStore = create<TrustsStore>(set => {
  async function updateTop10(stats: Record<string, TrustsStats>) {
    const sorted = Object.values(stats)
      .map(player => ({
        address: player.player,
        score: player.mutualTrusts,
      }))
      .sort((a, b) => b.score - a.score);

    const top10 = sorted.slice(0, 10).filter(player => player.score > 0);

    const profiles = await getProfiles(sorted.map(player => player.address));
    set({
      top10: top10.map(player => ({
        ...player,
        name: profiles.get(player.address)?.name,
        image: profiles.get(player.address)?.image,
      })),
      scores: sorted.map(player => ({
        ...player,
        name: profiles.get(player.address)?.name,
        image: profiles.get(player.address)?.image,
      })),
    });
  }
  return {
    stats: {},
    loading: false,
    error: null,
    top10: [],
    scores: [],
    trustMap: {},

    fetchStats: async () => {
      set({ loading: true, error: null });
      const players = usePlayersStore.getState().players;
      const playerAddresses = players.map(p => p.address.toLowerCase());
      try {
        const _trustMap = await getTrustInits(playerAddresses);
        const _stats: Record<string, TrustsStats> =
          useTrustsStore.getState().stats;
        players.forEach(player => {
          const addr = player.address.toLowerCase();
          _stats[player.address] = {
            player: player.address,
            trusts: _trustMap[addr].out.length,
            mutualTrusts: _trustMap[addr].mutual.length,
          };
        });
        set({ stats: _stats, loading: false, trustMap: _trustMap });
        await updateTop10(_stats);
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : String(error),
          loading: false,
        });
      }
    },

    subscribeToStats: (playerAddresses: string[]) => {
      const subscription = subscribeToTrusts(
        playerAddresses,
        async (trusts: Trust[]) => {
          const _trustMap = useTrustsStore.getState().trustMap;
          trusts.forEach(t => {
            const truster = t.truster.id.toLowerCase();
            const trustee = t.trustee.id.toLowerCase();
            if (
              _trustMap[truster] &&
              !_trustMap[truster].out.includes(trustee)
            ) {
              _trustMap[truster].out.push(trustee);

              if (
                _trustMap[truster].in.includes(trustee) &&
                !_trustMap[truster].mutual.includes(trustee)
              ) {
                _trustMap[truster].mutual.push(trustee);
              }
            }
            if (
              _trustMap[trustee] &&
              !_trustMap[trustee].in.includes(truster)
            ) {
              _trustMap[trustee].in.push(truster);

              if (
                _trustMap[trustee].out.includes(truster) &&
                !_trustMap[trustee].mutual.includes(truster)
              ) {
                _trustMap[trustee].mutual.push(truster);
              }
            }
          });

          const _stats = useTrustsStore.getState().stats;
          const _players = usePlayersStore.getState().players;
          _players.forEach(player => {
            const addr = player.address.toLowerCase();
            _stats[player.address] = {
              player: player.address,
              trusts: _trustMap[addr]?.out?.length,
              mutualTrusts: _trustMap[addr]?.mutual?.length,
            };
          });
          set({ stats: _stats, loading: false, trustMap: _trustMap });
          await updateTop10(_stats);
        }
      );
      return subscription;
    },
  };
});
