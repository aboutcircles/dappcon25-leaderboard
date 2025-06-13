import { useRef, useState } from 'react';
import ScoreTable from './ScoreTable';

export default function MobileScores({
  setShowScores,
}: {
  setShowScores: (show: boolean) => void;
}) {
  const startY = useRef<number | null>(null);
  const [tab, setTab] = useState<'invites' | 'trusts'>('invites');

  const handleTouchStart = () => {
    setShowScores(true);
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="absolute top-2 right-2 z-60 rounded-full p-2 text-white  transition"
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
      <div className="flex flex-col justify-center items-center w-full h-[100vh]">
        <div className="w-full bg-black bg-opacity-80 flex flex-col h-full items-center">
          <div className="w-full px-2 flex-1 pt-15 overflow-y-scroll pb-12">
            {tab === 'invites' && (
              <ScoreTable type="invites" forceShow={true} />
            )}
            {tab === 'trusts' && <ScoreTable type="trusts" forceShow={true} />}
          </div>
          <div
            className="flex flex-row w-full justify-center border-t border-white/80 text-white z-50 fixed bottom-0 h-10"
            style={{ fontSize: '0.5rem' }}
          >
            <button
              className={`flex-1 py-2 text-center font-bold transition border-r border-white/40 bg-black ${
                tab === 'invites' ? 'text-[#00e2ff]' : ''
              }`}
              onClick={() => setTab('invites')}
            >
              invites
            </button>
            <button
              className={`flex-1 py-2 text-center font-bold transition bg-black ${
                tab === 'trusts' ? 'text-[#71ff49]' : ''
              }`}
              onClick={() => setTab('trusts')}
            >
              trusts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
