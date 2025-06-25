import { create } from 'zustand';
import { fetchInvites, subscribeToInvites } from '@/lib/envio/invites';
import { usePlayersStore } from '@/stores/playersStore';
import { TopPlayer, InvitesStats } from '@/types';
import { getProfiles } from '@/lib/getProfiles';
// import { devtools } from 'zustand/middleware';

interface InvitesStore {
  invitesStats: Record<string, InvitesStats>;
  invitesLoading: boolean;
  invitesError: string | null;
  invitesTop10: TopPlayer[];
  invitesScores: TopPlayer[];

  fetchInvitesStats: () => Promise<void>;
  subscribeToInvitesStats: (playerAddresses: string[]) => {
    unsubscribe: () => void;
  };
}

export const useInvitesStore = create<InvitesStore>()(
  // devtools(set => {
  set => {
    async function updateInvitesTop10(stats: Record<string, InvitesStats>) {
      const sorted = Object.values(stats)
        .map(player => ({
          address: player.player,
          score: player.invitesRedeemed,
        }))
        .sort((a, b) => b.score - a.score);

      const top10 = sorted.slice(0, 10).filter(player => player.score > 0);

      const profiles = await getProfiles(sorted.map(player => player.address));
      set({
        invitesTop10: top10.map(player => ({
          ...player,
          name: profiles.get(player.address)?.name,
          // image: profiles.get(player.address)?.image,
        })),
        invitesScores: sorted.map(player => ({
          ...player,
          name: profiles.get(player.address)?.name,
          // image: profiles.get(player.address)?.image,
        })),
      });
    }

    return {
      invitesStats: {},
      invitesLoading: false,
      invitesError: null,
      invitesTop10: [],
      invitesScores: [],

      fetchInvitesStats: async () => {
        set({ invitesLoading: true, invitesError: null });
        const players = usePlayersStore.getState().players;
        const playerAddresses = players.map(p => p.address);
        try {
          const { invitesRedeemed } = await fetchInvites(playerAddresses);
          console.log('Init invites fetched:', invitesRedeemed);
          const invitesRedeemedMap = new Map<string, number>();
          invitesRedeemed.forEach(a => {
            const invitedBy = a.invitedBy.toLowerCase();
            if (invitedBy) {
              invitesRedeemedMap.set(
                invitedBy,
                (invitesRedeemedMap.get(invitedBy) || 0) + 1
              );
            }
          });
          const _stats: Record<string, InvitesStats> = {
            ...useInvitesStore.getState().invitesStats,
          };
          playerAddresses.forEach(addr => {
            _stats[addr] = {
              player: addr,
              invitesRedeemed: invitesRedeemedMap.get(addr.toLowerCase()) || 0,
              invitesSent: 0,
            };
          });
          set({ invitesStats: _stats, invitesLoading: false });
          await updateInvitesTop10(_stats);
        } catch (error) {
          set({
            invitesError:
              error instanceof Error ? error.message : String(error),
            invitesLoading: false,
          });
        }
      },

      subscribeToInvitesStats: (playerAddresses: string[]) => {
        const subscription = subscribeToInvites(
          playerAddresses,
          async ({ invitesRedeemed }) => {
            console.log('Invites redeemed subscription:', invitesRedeemed);
            const invitesRedeemedMap = new Map<string, number>();
            invitesRedeemed.forEach(a => {
              const invitedBy = a.invitedBy.toLowerCase();
              if (invitedBy) {
                invitesRedeemedMap.set(
                  invitedBy,
                  (invitesRedeemedMap.get(invitedBy) || 0) + 1
                );
              }
            });

            const _stats: Record<string, InvitesStats> = {
              ...useInvitesStore.getState().invitesStats,
            };
            playerAddresses.forEach(addr => {
              _stats[addr] = {
                player: addr,
                invitesRedeemed:
                  invitesRedeemedMap.get(addr.toLowerCase()) || 0,
                invitesSent: 0,
              };
            });
            set({ invitesStats: _stats });
            await updateInvitesTop10(_stats);
          }
        );
        return subscription;
      },
    };
  }
);
// );
