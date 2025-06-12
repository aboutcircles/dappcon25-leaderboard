'use client';

import { useEffect, useState, useRef } from 'react';
import { usePlayersStore } from '@/stores/playersStore';
import { useInvitesStore } from '@/stores/invitesStore';
import { useTrustsStore } from '@/stores/trustsStore';
import PlayersList from '@/components/PlayersList';

import dynamic from 'next/dynamic';
import QRcodeBanner from '@/components/QRcodeBanner';

const RocketCanvas = dynamic(() => import('@/components/RocketCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const [tableWidth, setTableWidth] = useState(0);
  const loading = usePlayersStore(state => state.loading);
  const error = usePlayersStore(state => state.error);
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

  const [showScores, setShowScores] = useState(false);
  const startY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current !== null) {
      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY > 80) {
        setShowScores(false);
        startY.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    startY.current = null;
  };

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
        <RocketCanvas tableWidth={tableWidth} />
      </div>
      <div className="relative z-10 w-full h-full flex flex-col flex-1">
        <main className="flex flex-col justify-between flex-1 h-full z-10 min-w-screen">
          {loading && <div>Loading players...</div>}
          {error && <div className="text-red-500">Error: {error}</div>}
          {!loading && !error && (
            <div className="text-white flex-1 flex flex-row justify-between w-full">
              <div className="flex flex-col justify-between flex-1">
                <div className="flex flex-row justify-evenly flex-1 w-full">
                  <div className="border-r border-dashed border-white/80 w-1/2 mt-4">
                    <h1 className="text-lg sm:text-2xl mt-4 font-bold text-center text-[#00e2ff]">
                      Top inviters
                    </h1>
                  </div>
                  <div className="w-1/2 mt-4">
                    <h1 className="text-lg sm:text-2xl mt-4 font-bold text-center text-[#71ff49]">
                      Top trusters
                    </h1>
                  </div>
                </div>

                <QRcodeBanner />
              </div>

              <PlayersList setTableWidth={setTableWidth} />
            </div>
          )}
          <button
            className="sm:hidden h-10 border-t border-white/80 flex items-center justify-center text-white"
            style={{ fontSize: '0.5rem' }}
            onClick={() => setShowScores(true)}
          >
            see scores
          </button>
        </main>
      </div>
      {/* Modal for mobile scores */}
      {showScores && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            className="absolute top-4 right-4 z-60 rounded-full p-2 text-white  transition"
            onClick={() => setShowScores(false)}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="flex flex-col justify-center items-center w-full">
            <PlayersList forceShow={true} />
          </div>
        </div>
      )}
    </div>
  );
}
