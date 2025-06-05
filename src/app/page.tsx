'use client';

import { useEffect } from 'react';
import { usePlayersStore } from '@/stores/playersStore';
import { useInvitesStore } from '@/stores/invitesStore';
import { useTrustsStore } from '@/stores/trustsStore';
import NightSkyCanvas from '@/components/NightSkyCanvas';

export default function Home() {
  const players = usePlayersStore(state => state.players);
  const loading = usePlayersStore(state => state.loading);
  const error = usePlayersStore(state => state.error);
  const fetchPlayers = usePlayersStore(state => state.fetchPlayers);
  const subscribeToPlayersUpdates = usePlayersStore(
    state => state.subscribeToPlayersUpdates
  );

  const fetchInvitesStats = useInvitesStore(state => state.fetchStats);
  const invitesStats = useInvitesStore(state => state.stats);
  const subscribeToInvitesStats = useInvitesStore(
    state => state.subscribeToStats
  );

  const fetchTrustStats = useTrustsStore(state => state.fetchStats);
  // const trustStats = useTrustsStore(state => state.stats);
  const subscribeToTrustStats = useTrustsStore(state => state.subscribeToStats);

  console.log('players', players);

  useEffect(() => {
    const init = async () => {
      await fetchPlayers();
      await fetchInvitesStats();
      await fetchTrustStats();
    };
    init();
    subscribeToPlayersUpdates();

    const subInvites = subscribeToInvitesStats();
    const subTrusts = subscribeToTrustStats();
    return () => {
      subInvites.unsubscribe();
      subTrusts.unsubscribe();
    };
  }, [
    fetchPlayers,
    subscribeToPlayersUpdates,
    fetchInvitesStats,
    subscribeToInvitesStats,
    fetchTrustStats,
    subscribeToTrustStats,
  ]);

  console.log('invitesStats', invitesStats);
  return (
    <div className="relative w-full h-screen min-h-screen">
      <div className="absolute inset-0 z-0 w-full h-full">
        <NightSkyCanvas />
      </div>
      <div className="relative z-10 w-full h-full flex flex-col flex-1">
        <main className="flex flex-col flex-1 h-full">
          {loading && <div>Loading players...</div>}
          {error && <div className="text-red-500">Error: {error}</div>}
          <div className="text-white">
            <h1>Hello</h1>
          </div>
        </main>
      </div>
    </div>
  );
}
