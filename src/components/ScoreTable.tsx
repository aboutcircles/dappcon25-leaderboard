import React, { useEffect, useRef } from 'react';
// import { usePlayersStore } from '@/stores/playersStore';
import { useTrustsStore } from '@/stores/trustsStore';
import { useInvitesStore } from '@/stores/invitesStore';
import Image from 'next/image';
import { TopPlayer } from '@/types';

const ScoreTable: React.FC<{
  setTableWidth?: (width: number) => void;
  forceShow?: boolean;
  type: 'invites' | 'trusts';
}> = ({ setTableWidth, forceShow = false, type }) => {
  const invites = useInvitesStore(state => state.invitesStats);
  const trusts = useTrustsStore(state => state.trustsStats);

  const inviteScores = useInvitesStore(state => state.invitesScores);
  const trustScores = useTrustsStore(state => state.trustsScores);
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
    <table className="border border-white/80 border-collapse bg-transparent w-full">
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
              <a
                href={`https://app.metri.xyz/${profile.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate max-w-[120px] sm:max-w-[180px]"
              >
                {profile.name}
              </a>
            </td>
            {type === 'invites' && (
              <td className="px-1 py-1  text-white align-middle">
                {invites[profile.address]?.invitesRedeemed || ''}
              </td>
            )}
            {type === 'trusts' && (
              <td className="px-1 py-1  text-white align-middle">
                {trusts[profile.address]?.mutualTrusts || ''}
                {/* {trusts[profile.address]?.trusts || ''} */}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div
      className={`${forceShow ? 'flex' : 'hidden'} sm:flex flex-col`}
      style={{ fontSize: '10px', fontFamily: 'monospace' }}
      ref={tableRef}
    >
      <div className="overflow-y-auto max-h-[80vh]">
        {type === 'invites'
          ? renderTable(inviteScores, 'invites')
          : renderTable(trustScores, 'trusts')}
      </div>
    </div>
  );
};

export default ScoreTable;
