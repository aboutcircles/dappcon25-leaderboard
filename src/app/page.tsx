'use client';

import { useEffect } from 'react';
import { usePlayersStore } from '@/stores/playersStore';

export default function Home() {
  const players = usePlayersStore(state => state.players);
  const loading = usePlayersStore(state => state.loading);
  const error = usePlayersStore(state => state.error);
  const fetchPlayers = usePlayersStore(state => state.fetchPlayers);
  const subscribeToNewEvents = usePlayersStore(
    state => state.subscribeToNewEvents
  );

  console.log('players', players);

  useEffect(() => {
    fetchPlayers();
    subscribeToNewEvents();
  }, [fetchPlayers, subscribeToNewEvents]);

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
                  <strong>Address:</strong> {player.address}
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
