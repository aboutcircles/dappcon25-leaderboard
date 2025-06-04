'use client';

import { useEffect } from 'react';
import { usePlayersStore } from '@/stores/playersStore';
import { useInvitesStore } from '@/stores/invitesStore';

export default function Home() {
  const players = usePlayersStore(state => state.players);
  const loading = usePlayersStore(state => state.loading);
  const error = usePlayersStore(state => state.error);
  const fetchPlayers = usePlayersStore(state => state.fetchPlayers);
  const subscribeToNewEvents = usePlayersStore(
    state => state.subscribeToNewEvents
  );

  const fetchStats = useInvitesStore(state => state.fetchStats);
  const stats = useInvitesStore(state => state.stats);
  const subscribeToStats = useInvitesStore(state => state.subscribeToStats);

  console.log('players', players);

  useEffect(() => {
    const init = async () => {
      await fetchPlayers();
      await fetchStats();
    };
    init();
    subscribeToNewEvents();

    const sub = subscribeToStats();
    return () => {
      sub.unsubscribe();
    };
  }, [fetchPlayers, subscribeToNewEvents, fetchStats, subscribeToStats]);

  console.log('stats', stats);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {loading && <div>Loading players...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
        {!loading && !error && (
          <ul className="list-disc pl-4">
            {players.map(player => (
              <li key={player.address}>
                <div>
                  <strong>Address:</strong> {player.address} invites redeemed:{' '}
                  {stats[player.address]?.invitesRedeemed} invites sent:{' '}
                  {stats[player.address]?.invitesSent}
                </div>
              </li>
            ))}
            {players.length === 0 && <li>No players found.</li>}
          </ul>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        footer
      </footer>
    </div>
  );
}
