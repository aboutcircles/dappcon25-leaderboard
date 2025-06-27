import { create } from 'zustand';
import { subscribeToTrusts, Trust } from '@/lib/envio/trusts';
import { usePlayersStore } from '@/stores/playersStore';
import { TopPlayer, TrustsStats } from '@/types';
import { getProfiles } from '@/lib/getProfiles';
import getTrustInits from '@/lib/nethermindIndexer/trustInits';
import { devtools } from 'zustand/middleware';

interface TrustsStore {
  trustsStats: Record<string, TrustsStats>;
  trustsLoading: boolean;
  trustsError: string | null;
  trustsTop10: TopPlayer[];
  trustsScores: TopPlayer[];

  trustMap: Record<string, { in: string[]; out: string[]; mutual: string[] }>;

  fetchTrustsStats: () => Promise<void>;
  subscribeToTrustsStats: (playerAddresses: string[]) => {
    unsubscribe: () => void;
  };
}

export const useTrustsStore = create<TrustsStore>()(
  devtools(set => {
    async function updateTop10(stats: Record<string, TrustsStats>) {
      const sorted = Object.values(stats)
        .map(player => ({
          address: player.player,
          score: player.mutualTrusts,
          // score: player.trusts,
        }))
        .sort((a, b) => b.score - a.score);

      const top10 = sorted.slice(0, 10).filter(player => player.score > 0);

      const profiles = await getProfiles(sorted.map(player => player.address));
      set({
        trustsTop10: top10.map(player => ({
          ...player,
          name: profiles.get(player.address)?.name,
        })),
        trustsScores: sorted.map(player => ({
          ...player,
          name: profiles.get(player.address)?.name,
        })),
      });
    }
    return {
      trustsStats: {},
      trustsLoading: false,
      trustsError: null,
      trustsTop10: [],
      trustsScores: [],
      trustMap: {},

      fetchTrustsStats: async () => {
        set({ trustsLoading: true, trustsError: null });
        const players = usePlayersStore.getState().players;
        const playerAddresses = players.map(p => p.address.toLowerCase());
        try {
          const _trustMap = await getTrustInits(playerAddresses);
          console.log('Init trusts fetched:', _trustMap);
          const _stats: Record<string, TrustsStats> = {
            ...useTrustsStore.getState().trustsStats,
          };
          players.forEach(player => {
            const addr = player.address.toLowerCase();
            _stats[player.address] = {
              player: player.address,
              trusts: _trustMap[addr].out.length,
              mutualTrusts: _trustMap[addr].mutual.length,
            };
          });
          set({
            trustsStats: _stats,
            trustsLoading: false,
            trustMap: _trustMap,
          });
          await updateTop10(_stats);
        } catch (error) {
          set({
            trustsError: error instanceof Error ? error.message : String(error),
            trustsLoading: false,
          });
        }
      },

      subscribeToTrustsStats: (playerAddresses: string[]) => {
        const subscription = subscribeToTrusts(
          playerAddresses,
          async (trusts: Trust[]) => {
            const _trustMap = { ...useTrustsStore.getState().trustMap };
            console.log('Trusts subscription:', trusts);
            trusts.forEach(t => {
              const truster = t.truster.id.toLowerCase();
              const trustee = t.trustee.id.toLowerCase();
              if (truster === trustee) return;
              if (!_trustMap[truster]) {
                _trustMap[truster] = { in: [], out: [], mutual: [] };
              }
              if (!_trustMap[trustee]) {
                _trustMap[trustee] = { in: [], out: [], mutual: [] };
              }
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

            const _stats = { ...useTrustsStore.getState().trustsStats };
            const players = usePlayersStore.getState().players;
            players.forEach(player => {
              const addr = player.address.toLowerCase();
              _stats[player.address] = {
                player: player.address,
                trusts: _trustMap[addr]?.out?.length,
                mutualTrusts: _trustMap[addr]?.mutual?.length,
              };
            });
            set({
              trustsStats: _stats,
              trustsLoading: false,
              trustMap: _trustMap,
            });
            await updateTop10(_stats);
          }
        );
        return subscription;
      },
    };
  })
);
