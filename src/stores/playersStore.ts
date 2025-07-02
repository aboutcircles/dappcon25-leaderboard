import { create } from 'zustand';
import circlesData from '@/lib/circlesData';
import { TransactionHistoryRow } from '@circles-sdk/data';
// import { CrcV2_StreamCompleted } from '@circles-sdk/data/dist/events/events';
import { MIN_CIRCLES, ORG_ADDRESS, TIMESTAMP_START } from '@/const';
import { getAddress } from 'ethers';
import { Player, TransferData } from '@/types';
import { getProfiles } from '@/lib/getProfiles';
import { subscribeToTransfers } from '@/lib/envio/transfers';
import { TEAM } from '@/team';

interface PlayersStore {
  players: Player[];
  loading: boolean;
  error: string | null;
  fetchPlayers: () => Promise<void>;
  subscribeToPlayersUpdates: () => {
    unsubscribe: () => void;
  };

  newPlayersQueue: Player[];
  enqueueNewPlayer: (player: Player) => void;
  dequeueNewPlayer: () => void;
}

export const usePlayersStore = create<PlayersStore>(set => ({
  players: [],
  loading: false,
  error: null,
  newPlayersQueue: [],

  fetchPlayers: async () => {
    set({ loading: true, error: null });
    try {
      const query = circlesData.getTransactionHistory(
        ORG_ADDRESS as `0x${string}`,
        25
      );

      let hasResults = true;
      const playerMap = new Map<string, Player>();
      // console.log('Init fetch players:');
      while (hasResults) {
        hasResults = await query.queryNextPage();
        if (!hasResults || !query.currentPage) break;
        const rows = query.currentPage.results;
        rows.forEach((row: TransactionHistoryRow) => {
          const from = getAddress(row.from);

          if (
            row.attoCircles >= MIN_CIRCLES &&
            row.timestamp >= TIMESTAMP_START &&
            !TEAM.includes(from)
          ) {
            if (!playerMap.has(from)) {
              playerMap.set(from, {
                address: from,
                amount: row.attoCircles,
              });
            }
          }
        });
      }

      const players = Array.from(playerMap.values());
      const profilesMap = await getProfiles(players.map(p => p.address));
      // console.log('Getting profiles for initial players:', profilesMap);
      const playersWithProfiles = players.map(player => {
        const profile = profilesMap.get(player.address);
        return {
          ...player,
          name: profile?.name || undefined,
          // image: profile?.image || undefined,
        };
      });
      // playersWithProfiles.sort((a, b) => b.blockNumber - a.blockNumber);
      set({ players: playersWithProfiles, loading: false });
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error
            ? error.message
            : String(error) || 'Unknown error',
        loading: false,
      });
    }
  },

  subscribeToPlayersUpdates: () => {
    // console.log('Subscribing to players updates');
    try {
      const subscription = subscribeToTransfers(
        async (transfers: TransferData[]) => {
          // console.log('Transfers subscription:', transfers);
          for (const transfer of transfers) {
            const { from, value } = transfer;
            if (
              BigInt(value) >= MIN_CIRCLES &&
              !usePlayersStore
                .getState()
                .players.some(
                  p => p.address.toLowerCase() === from.toLowerCase()
                )
            ) {
              // Fetch profile for the new player
              // console.log('Fetching profile for new player:', from);
              const _from = getAddress(from);
              const profilesMap = await getProfiles([_from]);
              const profile = profilesMap.get(_from);
              // console.log('Profile for new player:', profile);
              const newPlayer = {
                address: _from,
                amount: BigInt(value),
                name: profile?.name || undefined,
                // image: profile?.image || undefined,
              };
              set(state => ({
                players: [newPlayer, ...state.players],
              }));
              usePlayersStore.getState().enqueueNewPlayer(newPlayer);
            }
          }
        }
      );
      return subscription;
    } catch (error) {
      console.error('Error subscribing to players updates:', error);
      return { unsubscribe: () => {} };
    }
  },

  enqueueNewPlayer: (player: Player) => {
    set(state => ({
      newPlayersQueue: [...state.newPlayersQueue, player],
    }));
  },

  dequeueNewPlayer: () => {
    set(state => ({
      newPlayersQueue: state.newPlayersQueue.slice(1),
    }));
  },
}));
