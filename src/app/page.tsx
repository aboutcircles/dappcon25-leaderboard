'use client';

import { useEffect, useState } from 'react';
import { usePlayersStore } from '@/stores/playersStore';
import { useInvitesStore } from '@/stores/invitesStore';
import { useTrustsStore } from '@/stores/trustsStore';
// import NightSkyCanvas from '@/components/NightSkyCanvas';
import PlayersList from '@/components/PlayersList';

import dynamic from 'next/dynamic';

const NightSkyCanvas = dynamic(() => import('@/components/NightSkyCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const [tableWidth, setTableWidth] = useState(0);
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

  const players = usePlayersStore(state => state.players);
  const playerAddresses = players.map(p => p.address);
  const playerAddressesString = playerAddresses.join(',');

  useEffect(() => {
    const init = async () => {
      await fetchPlayers();
      await fetchInvitesStats();
      await fetchTrustStats();
    };
    init();
    subscribeToPlayersUpdates();
  }, [
    fetchPlayers,
    subscribeToPlayersUpdates,
    fetchInvitesStats,
    fetchTrustStats,
  ]);

  useEffect(() => {
    const subInvites = subscribeToInvitesStats(playerAddresses);
    const subTrusts = subscribeToTrustStats(playerAddresses);

    return () => {
      subInvites.unsubscribe();
      subTrusts.unsubscribe();
    };
  }, [
    subscribeToInvitesStats,
    subscribeToTrustStats,
    playerAddresses,
    playerAddressesString,
  ]);

  return (
    <div className="relative w-full h-screen min-h-screen">
      <div className="absolute inset-0 z-0 w-full h-full">
        <NightSkyCanvas tableWidth={tableWidth} />
      </div>
      <div className="relative z-10 w-full h-full flex flex-col flex-1">
        <main className="flex flex-row flex-1 h-full">
          {/* {loading && <div>Loading players...</div>}
          {error && <div className="text-red-500">Error: {error}</div>} */}
          <div className="text-white flex flex-row justify-between w-full">
            <div className="flex flex-row gap-2 justify-evenly mt-8 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-center w-1/2">
                Top inviters
              </h1>
              <h1 className="text-lg sm:text-2xl font-bold text-center w-1/2">
                Top trusters
              </h1>
            </div>
            <PlayersList setTableWidth={setTableWidth} />
          </div>
        </main>
      </div>
    </div>
  );
}
