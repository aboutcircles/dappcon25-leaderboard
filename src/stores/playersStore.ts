import { create } from 'zustand';
import circlesData from '@/lib/circlesData';
import { TransactionHistoryRow } from '@circles-sdk/data';
import { parseEther } from 'ethers';

interface Player {
  address: string;
  transactionHash: string;
  amount: bigint;
}

interface PlayersStore {
  players: Player[];
  loading: boolean;
  error: string | null;
  fetchPlayers: () => Promise<void>;
}

const orgAddress = (process.env.NEXT_PUBLIC_ORG_ADDRESS || '').toLowerCase();
const minCircles = parseEther(process.env.NEXT_PUBLIC_MIN_CIRCLES || '1');
const startTimestamp = parseInt(
  process.env.NEXT_PUBLIC_START_TIMESTAMP || '1749023345'
);

export const usePlayersStore = create<PlayersStore>(set => ({
  players: [],
  loading: false,
  error: null,
  fetchPlayers: async () => {
    set({ loading: true, error: null });
    try {
      const query = circlesData.getTransactionHistory(
        orgAddress as `0x${string}`,
        25
      );
      let hasResults = true;
      const playerMap = new Map<string, Player>();
      while (hasResults) {
        hasResults = await query.queryNextPage();
        if (!hasResults || !query.currentPage) break;
        const rows = query.currentPage.results;
        rows.forEach((row: TransactionHistoryRow) => {
          if (
            row.attoCircles >= minCircles &&
            row.timestamp >= startTimestamp
          ) {
            if (!playerMap.has(row.from)) {
              playerMap.set(row.from, {
                address: row.from,
                transactionHash: row.transactionHash,
                amount: row.attoCircles,
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
}));
