import React from 'react';
import type { Profile, TopPlayer } from '../types';
import Image from 'next/image';
import { usePlayersStore } from '@/stores/playersStore';
import { useTrustsStore } from '@/stores/trustsStore';
import { useInvitesStore } from '@/stores/invitesStore';

const PlayersList: React.FC = () => {
  const players = usePlayersStore(state => state.players);
  const invites = useInvitesStore(state => state.stats);
  const trusts = useTrustsStore(state => state.stats);

  const length = players.length;
  return (
    <div
      className="overflow-x-auto h-full"
      style={{ fontSize: '10px', fontFamily: 'monospace' }}
    >
      <table className="border border-white/80 border-collapse bg-transparent">
        <thead style={{ fontSize: '6px' }}>
          <tr>
            <th className="px-1 py-1 border-b border-white/80 text-left text-white font-semibold">
              #
            </th>
            <th className="px-1 py-1 border-b border-white/80 text-left text-white font-semibold">
              Name
            </th>
            <th className="px-1 py-1 border-b border-white/80 text-left text-white font-semibold">
              Invites
            </th>
            <th className="px-1 py-1 border-b border-white/80 text-left text-white font-semibold">
              Trusts
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((profile, idx) => (
            <tr key={profile.address} className="hover:bg-white/10 transition">
              <td className="px-1 py-1 border-b border-white/80 text-white align-middle">
                {length - idx}
              </td>
              <td className="px-1 py-1 border-b border-white/80 text-white flex items-center gap-2 align-middle">
                {/* <Image
                  src={profile.image || '/images/circles.png'}
                  alt={profile.name || ''}
                  height={12}
                  width={12}
                  className="rounded-full object-cover border border-white/80 bg-white/10"
                /> */}

                <span className="truncate max-w-[120px] sm:max-w-[200px]">
                  {profile.name}
                </span>
              </td>
              <td className="px-1 py-1 border-b border-white/80 text-white align-middle">
                {invites[profile.address]?.invitesRedeemed || ''}
              </td>
              <td className="px-1 py-1 border-b border-white/80 text-white align-middle">
                {trusts[profile.address]?.mutualTrusts || ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayersList;
