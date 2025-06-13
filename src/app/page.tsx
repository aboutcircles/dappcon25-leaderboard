'use client';

import { useEffect, useState } from 'react';
import { usePlayersStore } from '@/stores/playersStore';
import { useInvitesStore } from '@/stores/invitesStore';
import { useTrustsStore } from '@/stores/trustsStore';

import dynamic from 'next/dynamic';
import QRcodeBanner from '@/components/QRcodeBanner';
import ScoreTable from '@/components/ScoreTable';
import MobileScores from '@/components/MobileScores';

const RocketCanvas = dynamic(() => import('@/components/RocketCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const [leftTableWidth, setLeftTableWidth] = useState(0);
  const [rightTableWidth, setRightTableWidth] = useState(0);
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
        <RocketCanvas
          leftTableWidth={leftTableWidth}
          rightTableWidth={rightTableWidth}
        />
      </div>
      <div className="relative z-10 w-full h-full flex flex-col flex-1">
        <main className="flex flex-col justify-between flex-1 h-full z-10 min-w-screen">
          {loading && <div>Loading players...</div>}
          {error && <div className="text-red-500">Error: {error}</div>}
          {!loading && !error && (
            <div className="text-white flex-1 flex flex-row justify-between w-full">
              <ScoreTable setTableWidth={setLeftTableWidth} type="invites" />
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

              <ScoreTable setTableWidth={setRightTableWidth} type="trusts" />
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
      {showScores && <MobileScores setShowScores={setShowScores} />}
    </div>
  );
}
