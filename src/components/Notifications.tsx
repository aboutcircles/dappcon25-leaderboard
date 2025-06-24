import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useEffect } from 'react';
import { usePlayersStore } from '@/stores/playersStore';
import { Player } from '@/types';
import Image from 'next/image';

const snack = (player: Player) => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={player.image || '/images/circles.png'}
        alt={player.name || player.address}
        height={16}
        width={16}
        className="rounded-full border border-white bg-gray-800 object-cover"
      />
      <span className="text-white font-bold">{player.name}</span>
      <span className="text-white">joined the game 🚀</span>
    </div>
  );
};

export default function Notifications() {
  const newPlayersQueue = usePlayersStore(state => state.newPlayersQueue);
  const dequeueNewPlayer = usePlayersStore(state => state.dequeueNewPlayer);

  useEffect(() => {
    if (newPlayersQueue.length > 0) {
      enqueueSnackbar(snack(newPlayersQueue[0]), {
        variant: 'default',
        style: { background: 'black', color: 'white' },
        autoHideDuration: 3000,
      });
      dequeueNewPlayer();
    }
  }, [newPlayersQueue, dequeueNewPlayer]);

  return (
    <div className="z-[3000]">
      <SnackbarProvider
        maxSnack={5}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        classes={{
          containerRoot: 'z-[9999]',
        }}
      />
    </div>
  );
}
