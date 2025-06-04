import { create } from 'zustand';
import { fetchTrusts, subscribeToTrusts, Trust } from '@/lib/trusts';
import { usePlayersStore } from '@/stores/playersStore';

export interface TrustsStats {
  player: string;
  trusts: number;
  mutualTrusts: number;
}

interface TrustsStore {
  stats: Record<string, TrustsStats>;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  subscribeToStats: () => { unsubscribe: () => void };
}

export const useTrustsStore = create<TrustsStore>(set => ({
  stats: {},
  loading: false,
  error: null,
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
          mutualTrustsMap.set(truster, (mutualTrustsMap.get(truster) || 0) + 1);
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
      (trusts: Trust[]) => {
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
      }
    );
    return subscription;
  },
}));
