import { create } from 'zustand';
import { fetchInvites, subscribeToInvites } from '@/lib/envioInvites';
import { usePlayersStore } from '@/stores/playersStore';

export interface InvitesStats {
  player: string;
  invitesSent: number;
  invitesRedeemed: number;
}

interface InvitesStore {
  stats: Record<string, InvitesStats>;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  subscribeToStats: () => { unsubscribe: () => void };
}

export const useInvitesStore = create<InvitesStore>(set => ({
  stats: {},
  loading: false,
  error: null,
  fetchStats: async () => {
    set({ loading: true, error: null });
    const players = usePlayersStore.getState().players;
    const playerAddresses = players.map(p => p.address);
    try {
      const { invitesRedeemed, invitesSent } = await fetchInvites(
        playerAddresses
      );
      const invitesRedeemedMap = new Map<string, number>();
      invitesRedeemed.forEach(a => {
        if (a.invitedBy) {
          invitesRedeemedMap.set(
            a.invitedBy,
            (invitesRedeemedMap.get(a.invitedBy) || 0) + 1
          );
        }
      });

      const invitesSentMap = new Map<string, number>();
      invitesSent.forEach(a => {
        if (a.truster_id) {
          invitesSentMap.set(
            a.truster_id,
            (invitesSentMap.get(a.truster_id) || 0) + 1
          );
        }
      });
      const stats: Record<string, InvitesStats> = {};
      playerAddresses.forEach(addr => {
        stats[addr] = {
          player: addr,
          invitesRedeemed: invitesRedeemedMap.get(addr) || 0,
          invitesSent: invitesSentMap.get(addr) || 0,
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
    const subscription = subscribeToInvites(
      playerAddresses,
      ({ invitesRedeemed, invitesSent }) => {
        const invitesRedeemedMap = new Map<string, number>();
        invitesRedeemed.forEach(a => {
          if (a.invitedBy) {
            invitesRedeemedMap.set(
              a.invitedBy,
              (invitesRedeemedMap.get(a.invitedBy) || 0) + 1
            );
          }
        });

        const invitesSentMap = new Map<string, number>();
        invitesSent.forEach(a => {
          if (a.truster_id) {
            invitesSentMap.set(
              a.truster_id,
              (invitesSentMap.get(a.truster_id) || 0) + 1
            );
          }
        });

        const stats: Record<string, InvitesStats> = {};
        playerAddresses.forEach(addr => {
          stats[addr] = {
            player: addr,
            invitesRedeemed: invitesRedeemedMap.get(addr) || 0,
            invitesSent: invitesSentMap.get(addr) || 0,
          };
        });
        set({ stats });
      }
    );
    return subscription;
  },
}));
