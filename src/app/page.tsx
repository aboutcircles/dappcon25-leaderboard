'use client';

import { useEffect } from 'react';
import { usePlayersStore } from '@/stores/playersStore';
import { useInvitesStore } from '@/stores/invitesStore';
import { useTrustsStore } from '@/stores/trustsStore';
import NightSkyCanvas from '@/components/NightSkyCanvas';
import PlayersList from '@/components/PlayersList';

export default function Home() {
  // const loading = usePlayersStore(state => state.loading);
  // const error = usePlayersStore(state => state.error);
  const fetchPlayers = usePlayersStore(state => state.fetchPlayers);
  const subscribeToPlayersUpdates = usePlayersStore(
    state => state.subscribeToPlayersUpdates
  );

  const fetchInvitesStats = useInvitesStore(state => state.fetchStats);
  const subscribeToInvitesStats = useInvitesStore(
    state => state.subscribeToStats
  );

  const fetchTrustStats = useTrustsStore(state => state.fetchStats);
  const subscribeToTrustStats = useTrustsStore(state => state.subscribeToStats);

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

  return (
    <div className="relative w-full h-screen min-h-screen">
      <div className="absolute inset-0 z-0 w-full h-full">
        <NightSkyCanvas />
      </div>
      <div className="relative z-10 w-full h-full flex flex-col flex-1">
        <main className="flex flex-row flex-1 h-full">
          <PlayersList />
          {/* {loading && <div>Loading players...</div>}
          {error && <div className="text-red-500">Error: {error}</div>} */}
          <div className="text-white flex flex-row flex-1 gap-2 justify-evenly mt-4 h-full">
            <h1 className="text-xl sm:text-3xl font-bold text-center">
              Top inviters
            </h1>
            <h1 className="text-xl sm:text-3xl font-bold text-center">
              Top trusters
            </h1>
          </div>
        </main>
      </div>
    </div>
  );
}
