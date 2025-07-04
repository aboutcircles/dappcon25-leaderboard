'use client';

import { useEffect, useState } from 'react';
import { usePlayersStore } from '@/stores/playersStore';
import { useInvitesStore } from '@/stores/invitesStore';
import { useTrustsStore } from '@/stores/trustsStore';

import dynamic from 'next/dynamic';
import ScoreTable from '@/components/ScoreTable';
import MobileScores from '@/components/MobileScores';
import Rewards from '@/components/Rewards';
import Instructions from '@/components/Instructions';
import QRcodeUFO from '@/components/QRcodeUFO';
import QRcodeBanner from '@/components/QRcodeBanner';
import Winners from '@/components/Winners';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_tick, setTick] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen min-h-screen max-h-[100vh]">
      <div className="absolute inset-0 z-0 w-full h-full">
        <RocketCanvas
          leftTableWidth={leftTableWidth}
          rightTableWidth={rightTableWidth}
        />
      </div>
      <div className="relative z-10 w-full h-full flex flex-col flex-1">
        <main className="flex flex-col justify-between flex-1 z-10 min-w-screen max-h-[100vh] h-screen">
          {loading && <div>Loading players...</div>}
          {error && <div className="text-red-500">Error: {error}</div>}
          {!loading && !error && (
            <div className="text-white flex flex-row w-full flex-1">
              <div className="self-start">
                <ScoreTable setTableWidth={setLeftTableWidth} type="invites" />
              </div>

              <div className="flex flex-col justify-between flex-1">
                <div className="flex flex-row justify-evenly w-full h-full">
                  <div className="border-r border-dashed border-white/80 w-1/2 mt-4">
                    <h1 className="text-lg sm:text-2xl mt-4 font-bold text-center text-[#00e2ff]">
                      Top inviters
                    </h1>
                  </div>
                  <div className="w-1/2 mt-4">
                    <h1 className="text-lg sm:text-2xl mt-4 font-bold text-center text-[#71ff49]">
                      Top mutual trust
                    </h1>
                  </div>
                </div>
              </div>

              <div>
                <ScoreTable setTableWidth={setRightTableWidth} type="trusts" />
              </div>
            </div>
          )}
          <div className="w-full flex flex-row items-end justify-between">
            <div className="flex sm:hidden">
              <QRcodeBanner />
            </div>
            <div className="hidden sm:flex">
              <QRcodeUFO />
            </div>
            <div className="hidden sm:flex flex-row items-end h-full">
              <Rewards />
            </div>
            <div className="hidden sm:flex flex-row items-end h-full">
              <Instructions />
            </div>
            {/* <div className="hidden sm:flex flex-row items-end h-full">
              <Countdown />
            </div> */}
          </div>
          <button
            className="sm:hidden h-10 border-t border-white/80 flex items-center justify-center text-white"
            style={{ fontSize: '0.5rem' }}
            onClick={() => setShowScores(true)}
          >
            see scores & rewards
          </button>
        </main>
      </div>
      <Winners
        leftTableWidth={leftTableWidth}
        rightTableWidth={rightTableWidth}
      />
      {/* Modal for mobile scores */}
      {showScores && <MobileScores setShowScores={setShowScores} />}
    </div>
  );
}
