import { create } from 'zustand';
import circlesData from '@/lib/circlesData';
import { CirclesEvent, TransactionHistoryRow } from '@circles-sdk/data';
import { CrcV2_StreamCompleted } from '@circles-sdk/data/dist/events/events';
import { MIN_CIRCLES, ORG_ADDRESS, TIMESTAMP_START } from '@/const';
import { getAddress } from 'ethers';
import { Player } from '@/types';
import { getProfiles } from '@/lib/getProfiles';

interface PlayersStore {
  players: Player[];
  loading: boolean;
  error: string | null;
  fetchPlayers: () => Promise<void>;
  subscribeToPlayersUpdates: () => Promise<void>;
  newPlayersQueue: Player[];
  enqueueNewPlayer: (player: Player) => void;
  dequeueNewPlayer: () => void;
}

function isTransferEvent(event: CirclesEvent) {
  if (event.$event === 'CrcV2_StreamCompleted') {
    return true;
  }
  return false;
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
      console.log('Init fetch players:');
      while (hasResults) {
        hasResults = await query.queryNextPage();
        if (!hasResults || !query.currentPage) break;
        const rows = query.currentPage.results;
        rows.forEach((row: TransactionHistoryRow) => {
          const from = getAddress(row.from);

          if (
            row.attoCircles >= MIN_CIRCLES &&
            row.timestamp >= TIMESTAMP_START
          ) {
            if (!playerMap.has(from)) {
              console.log('adding player:', from);
              playerMap.set(from, {
                address: from,
                transactionHash: row.transactionHash,
                amount: row.attoCircles,
                blockNumber: row.blockNumber,
                timestamp: row.timestamp,
              });
            }
          }
        });
      }

      const players = Array.from(playerMap.values());
      const profilesMap = await getProfiles(players.map(p => p.address));
      console.log('Getting profiles for initial players:', profilesMap);
      const playersWithProfiles = players.map(player => {
        const profile = profilesMap.get(player.address);
        return {
          ...player,
          name: profile?.name || undefined,
          // image: profile?.image || undefined,
        };
      });
      playersWithProfiles.sort((a, b) => b.blockNumber - a.blockNumber);
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

  subscribeToPlayersUpdates: async () => {
    try {
      const avatarEvents = await circlesData.subscribeToEvents(
        ORG_ADDRESS as `0x${string}`
      );
      avatarEvents.subscribe(async (event: CirclesEvent) => {
        if (event && isTransferEvent(event)) {
          const { from, transactionHash, amount, timestamp, blockNumber } =
            event as CrcV2_StreamCompleted;
          console.log('New transfer event:', from);
          if (
            typeof from === 'string' &&
            typeof transactionHash === 'string' &&
            typeof amount === 'bigint' &&
            typeof timestamp === 'number' &&
            amount >= MIN_CIRCLES &&
            timestamp >= TIMESTAMP_START &&
            !usePlayersStore.getState().players.some(p => p.address === from)
          ) {
            // Fetch profile for the new player
            console.log('Fetching profile for new player:', from);
            const _from = getAddress(from);
            const profilesMap = await getProfiles([_from]);
            const profile = profilesMap.get(_from);
            console.log('Profile for new player:', profile);
            const newPlayer = {
              address: _from,
              transactionHash,
              amount,
              blockNumber,
              name: profile?.name || undefined,
              // image: profile?.image || undefined,
              timestamp: timestamp,
            };
            set(state => ({
              players: [newPlayer, ...state.players],
            }));
            // Enqueue new player for notifications
            usePlayersStore.getState().enqueueNewPlayer(newPlayer);
          }
        }
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
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
