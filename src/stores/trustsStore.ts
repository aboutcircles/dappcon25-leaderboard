import { create } from 'zustand';
import { fetchTrusts, subscribeToTrusts, Trust } from '@/lib/envio/trusts';
import { usePlayersStore } from '@/stores/playersStore';
import { TopPlayer, TrustsStats } from '@/types';
import { getProfiles } from '@/lib/getProfiles';

interface TrustsStore {
  stats: Record<string, TrustsStats>;
  loading: boolean;
  error: string | null;
  top10: TopPlayer[];

  fetchStats: () => Promise<void>;
  subscribeToStats: () => { unsubscribe: () => void };
}

export const useTrustsStore = create<TrustsStore>(set => {
  async function updateTop10(stats: Record<string, TrustsStats>) {
    const sorted = Object.values(stats)
      .sort((a, b) => b.mutualTrusts - a.mutualTrusts)
      .slice(0, 10)
      .filter(player => player.mutualTrusts > 0)
      .map(player => ({
        address: player.player,
        score: player.mutualTrusts,
      }));
    // set({ top10: sorted });
    const profiles = await getProfiles(sorted.map(player => player.address));
    set({
      top10: sorted.map(player => ({
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

    fetchStats: async () => {
      set({ loading: true, error: null });
      const players = usePlayersStore.getState().players;
      const playerAddresses = players.map(p => p.address);
      try {
        const trusts = await fetchTrusts(playerAddresses);
        const trustsMap = new Map<string, number>();
        const mutualTrustsMap = new Map<string, number>();
        trusts.forEach(t => {
          const truster = t.truster.id;
          trustsMap.set(truster, (trustsMap.get(truster) || 0) + 1);
          if (t.isMutual) {
            mutualTrustsMap.set(
              truster,
              (mutualTrustsMap.get(truster) || 0) + 1
            );
          }
        });
        const stats: Record<string, TrustsStats> = {};
        playerAddresses.forEach(addr => {
          stats[addr] = {
            player: addr,
            trusts: trustsMap.get(addr) || 0,
            mutualTrusts: mutualTrustsMap.get(addr) || 0,
          };
        });
        set({ stats, loading: false });
        await updateTop10(stats);
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : String(error),
          loading: false,
        });
      }
    },

    subscribeToStats: () => {
      const players = usePlayersStore.getState().players;
      const playerAddresses = players.map(p => p.address);
      const subscription = subscribeToTrusts(
        playerAddresses,
        async (trusts: Trust[]) => {
          const trustsMap = new Map<string, number>();
          const mutualTrustsMap = new Map<string, number>();
          trusts.forEach(t => {
            const truster = t.truster.id;
            trustsMap.set(truster, (trustsMap.get(truster) || 0) + 1);
            if (t.isMutual) {
              mutualTrustsMap.set(
                truster,
                (mutualTrustsMap.get(truster) || 0) + 1
              );
            }
          });
          const stats: Record<string, TrustsStats> = {};
          playerAddresses.forEach(addr => {
            stats[addr] = {
              player: addr,
              trusts: trustsMap.get(addr) || 0,
              mutualTrusts: mutualTrustsMap.get(addr) || 0,
            };
          });
          set({ stats });
          await updateTop10(stats);
        }
      );
      return subscription;
    },
  };
});
