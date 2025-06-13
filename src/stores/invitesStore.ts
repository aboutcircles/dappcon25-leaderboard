import { create } from 'zustand';
import { fetchInvites, subscribeToInvites } from '@/lib/envio/invites';
import { usePlayersStore } from '@/stores/playersStore';
import { TopPlayer, InvitesStats } from '@/types';
import { getProfiles } from '@/lib/getProfiles';

interface InvitesStore {
  stats: Record<string, InvitesStats>;
  loading: boolean;
  error: string | null;
  top10: TopPlayer[];
  scores: TopPlayer[];

  fetchStats: () => Promise<void>;
  subscribeToStats: (playerAddresses: string[]) => { unsubscribe: () => void };
}

export const useInvitesStore = create<InvitesStore>(set => {
  async function updateTop10(stats: Record<string, InvitesStats>) {
    const sorted = Object.values(stats)
      .map(player => ({
        address: player.player,
        score: player.invitesRedeemed * 3 + player.invitesSent * 0.5,
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
        console.log('=============INVITE stats', stats);
        set({ stats, loading: false });
        await updateTop10(stats);
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : String(error),
          loading: false,
        });
      }
    },

    subscribeToStats: (playerAddresses: string[]) => {
      const subscription = subscribeToInvites(
        playerAddresses,
        async ({ invitesRedeemed, invitesSent }) => {
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
          await updateTop10(stats);
        }
      );
      return subscription;
    },
  };
});
