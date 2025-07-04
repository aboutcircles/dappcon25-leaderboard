import React, { useEffect, useRef } from 'react';
// import { usePlayersStore } from '@/stores/playersStore';
import { useTrustsStore } from '@/stores/trustsStore';
import { useInvitesStore } from '@/stores/invitesStore';
import Image from 'next/image';
import { TopPlayer } from '@/types';

const PlayersList: React.FC<{
  setTableWidth?: (width: number) => void;
  forceShow?: boolean;
}> = ({ setTableWidth, forceShow = false }) => {
  // const players = usePlayersStore(state => state.players);
  const invites = useInvitesStore(state => state.stats);
  const trusts = useTrustsStore(state => state.stats);

  const inviteScores = useInvitesStore(state => state.scores);
  const trustScores = useTrustsStore(state => state.scores);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const handleResize = () => setTableWidth?.(table.clientWidth);

    // Initial measurement
    handleResize();

    // Use ResizeObserver for dynamic changes
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(table);

    // Cleanup
    return () => resizeObserver.disconnect();
  }, [setTableWidth]);

  // Helper to render the table
  const renderTable = (scores: TopPlayer[], type: 'invites' | 'trusts') => (
    <table className="border-b border-r border-l border-white/80 border-collapse bg-transparent w-full">
      <thead>
        <tr>
          <th className="px-1 py-1 border-b border-white/80 text-left text-white font-semibold">
            #
          </th>
          <th className="px-1 py-1 border-b border-white/80 text-left text-white font-semibold">
            Name
          </th>
          <th className="px-1 py-1 border-b border-white/80 text-left text-white font-semibold">
            {type === 'invites' ? 'Invites' : 'Trusts'}
          </th>
        </tr>
      </thead>
      <tbody>
        {scores.map((profile, idx) => (
          <tr
            key={profile.address}
            className="hover:bg-white/10 transition border-b border-white/80"
          >
            <td className="px-1 py-1 text-white align-middle">{idx + 1}</td>
            <td className="px-1 py-1 text-white flex items-center gap-2 align-middle">
              <Image
                src={profile.image || '/images/circles.png'}
                alt={profile.name || ''}
                height={12}
                width={12}
                className="rounded-full object-cover border border-white/80 bg-white/10"
              />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">
                {profile.name}
              </span>
            </td>
            {type === 'invites' && (
              <td className="px-1 py-1  text-white align-middle">
                {invites[profile.address]?.invitesSent || ''}/
                {invites[profile.address]?.invitesRedeemed || ''}
              </td>
            )}
            {type === 'trusts' && (
              <td className="px-1 py-1  text-white align-middle">
                {trusts[profile.address]?.trusts || ''}/
                {trusts[profile.address]?.mutualTrusts || ''}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div
      className={`${
        forceShow ? 'flex' : 'hidden'
      } sm:flex flex-col h-[100vh] overflow-y-hidden`}
      style={{ fontSize: '10px', fontFamily: 'monospace' }}
      ref={tableRef}
    >
      <div className="flex-1 overflow-y-auto">
        {renderTable(inviteScores, 'invites')}
      </div>
      <div className="h-4 border-t border-b border-dashed border-white/80"></div>
      <div className="flex-1 overflow-y-auto">
        {renderTable(trustScores, 'trusts')}
      </div>
    </div>
  );
};

export default PlayersList;
