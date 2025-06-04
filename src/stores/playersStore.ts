import { create } from 'zustand';
import circlesData from '@/lib/circlesData';
import { CirclesEvent, TransactionHistoryRow } from '@circles-sdk/data';
import { CrcV2_StreamCompleted } from '@circles-sdk/data/dist/events/events';
import { MIN_CIRCLES, ORG_ADDRESS, START_BLOCK } from '@/const';
import { getAddress } from 'ethers';

interface Player {
  address: string;
  transactionHash: string;
  blockNumber: number;
  amount: bigint;
}

interface PlayersStore {
  players: Player[];
  loading: boolean;
  error: string | null;
  fetchPlayers: () => Promise<void>;
  subscribeToNewEvents: () => Promise<void>;
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
  fetchPlayers: async () => {
    set({ loading: true, error: null });
    try {
      const query = circlesData.getTransactionHistory(
        ORG_ADDRESS as `0x${string}`,
        25
      );
      let hasResults = true;
      const playerMap = new Map<string, Player>();
      while (hasResults) {
        hasResults = await query.queryNextPage();
        if (!hasResults || !query.currentPage) break;
        const rows = query.currentPage.results;
        rows.forEach((row: TransactionHistoryRow) => {
          const from = getAddress(row.from);
          if (
            row.attoCircles >= MIN_CIRCLES &&
            row.blockNumber >= START_BLOCK
          ) {
            if (!playerMap.has(from)) {
              playerMap.set(from, {
                address: from,
                transactionHash: row.transactionHash,
                amount: row.attoCircles,
                blockNumber: row.blockNumber,
              });
            }
          }
        });
      }
      set({ players: Array.from(playerMap.values()), loading: false });
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
  subscribeToNewEvents: async () => {
    try {
      const avatarEvents = await circlesData.subscribeToEvents(
        ORG_ADDRESS as `0x${string}`
      );
      avatarEvents.subscribe((event: CirclesEvent) => {
        if (event && isTransferEvent(event)) {
          const { from, transactionHash, amount, timestamp, blockNumber } =
            event as CrcV2_StreamCompleted;
          if (
            typeof from === 'string' &&
            typeof transactionHash === 'string' &&
            typeof amount === 'bigint' &&
            typeof timestamp === 'number' &&
            amount >= MIN_CIRCLES &&
            blockNumber >= START_BLOCK &&
            !usePlayersStore.getState().players.some(p => p.address === from)
          ) {
            set(state => ({
              players: [
                ...state.players,
                {
                  address: from,
                  transactionHash,
                  amount,
                  blockNumber,
                },
              ],
            }));
          }
        }
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },
}));
