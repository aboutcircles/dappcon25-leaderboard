import { create } from 'zustand';
import circlesData from '@/lib/circlesData';
import { CirclesEvent } from '@circles-sdk/data';
import {
  CrcV2_InviteHuman,
  CrcV2_RegisterHuman,
  CrcV2_Trust,
} from '@circles-sdk/data/dist/events/events';
import { START_BLOCK } from '@/const';
import { usePlayersStore } from './playersStore';

export interface PlayerStats {
  player: string;
  invitesSent: number;
  invitesRedeemed: number;
  trustsOutgoing: number;
  trustsMutual: number;
}

interface EventsStore {
  stats: PlayerStats[];
  loading: boolean;
  error: string | null;
  fetchStats: (playerAddresses: string[]) => Promise<void>;
  // fetchStats: (playerAddresses: string[]) => Promise<void>;
  subscribeToStats: () => Promise<void>;
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  stats: [],
  loading: false,
  error: null,
  fetchStats: async () => {
    set({ loading: true, error: null });
    const players = usePlayersStore.getState().players;
    const playerAddresses = players.map(p => p.address);

    try {
      const statsMap = new Map<string, PlayerStats>();
      playerAddresses.forEach(addr => {
        statsMap.set(addr, {
          player: addr,
          invitesSent: 0,
          invitesRedeemed: 0,
          trustsOutgoing: 0,
          trustsMutual: 0,
        });
      });

      const allEvents = await circlesData.getEvents(
        undefined,
        START_BLOCK,
        undefined,
        ['CrcV2_InviteHuman', 'CrcV2_RegisterHuman', 'CrcV2_Trust']
      );

      allEvents.forEach((event: CirclesEvent) => {
        if (event.$event === 'CrcV2_InviteHuman') {
          const e = event as CrcV2_InviteHuman;
          if (e.inviter && statsMap.has(e.inviter)) {
            statsMap.get(e.inviter)!.invitesSent++;
          }
          if (e.invited && statsMap.has(e.invited)) {
            statsMap.get(e.invited)!.invitesRedeemed++;
          }
        }

        if (event.$event === 'CrcV2_RegisterHuman') {
          const e = event as CrcV2_RegisterHuman;
          if (e.inviter && statsMap.has(e.inviter)) {
            statsMap.get(e.inviter)!.invitesSent++;
          }
        }

        if (event.$event === 'CrcV2_Trust') {
          const e = event as CrcV2_Trust;
          if (e.truster && statsMap.has(e.truster)) {
            statsMap.get(e.truster)!.trustsOutgoing++;
          }
        }
      });
      const trustEvents = allEvents.filter(
        e => e.$event === 'CrcV2_Trust'
      ) as CrcV2_Trust[];
      trustEvents.forEach(e => {
        if (e.trustee && e.truster && statsMap.has(e.trustee)) {
          if (
            trustEvents.some(
              ev => ev.truster === e.trustee && ev.trustee === e.truster
            )
          ) {
            statsMap.get(e.trustee)!.trustsMutual++;
          }
        }
      });
      set({ stats: Array.from(statsMap.values()), loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        loading: false,
      });
    }
  },
  // fetchStats: async () => {
  //   const players = usePlayersStore.getState().players;

  //   //   query getInvitedBy($addressList: [String!]) {
  //   // Avatar(where: {invitedBy: {_in: $addressList}, version: {_eq: 2}}) {
  //   //   profile {
  //   //     name
  //   //   }
  //   //   timestamp
  //   // }
  //   // }
  // },

  subscribeToStats: async () => {
    const players = usePlayersStore.getState().players;
    try {
      const statsMap = new Map(get().stats.map(s => [s.player, { ...s }]));
      const eventSub = await circlesData.subscribeToEvents();
      eventSub.subscribe((event: CirclesEvent) => {
        let changed = false;
        if (event.$event === 'CrcV2_InviteHuman') {
          const e = event as CrcV2_InviteHuman;
          if (players.some(p => p.address === e.inviter)) {
            if (e.inviter && statsMap.has(e.inviter)) {
              statsMap.get(e.inviter)!.invitesSent++;
              changed = true;
            }
            if (e.invited && statsMap.has(e.invited)) {
              statsMap.get(e.invited)!.invitesRedeemed++;
              changed = true;
            }
          }
        }
        if (event.$event === 'CrcV2_RegisterHuman') {
          const e = event as CrcV2_RegisterHuman;
          if (e.inviter && statsMap.has(e.inviter)) {
            statsMap.get(e.inviter)!.invitesSent++;
            changed = true;
          }
        }
        if (event.$event === 'CrcV2_Trust') {
          const e = event as CrcV2_Trust;
          if (e.truster && statsMap.has(e.truster)) {
            statsMap.get(e.truster)!.trustsOutgoing++;
            changed = true;
          }
        }
        if (changed) set({ stats: Array.from(statsMap.values()) });
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },
}));
