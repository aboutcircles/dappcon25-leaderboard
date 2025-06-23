import React, { useEffect, useState } from 'react';
import { SHOW_WINNERS_TIMESTAMP } from '@/const';

function WinnersInner({
  leftTableWidth,
  rightTableWidth,
}: {
  leftTableWidth: number;
  rightTableWidth: number;
}) {
  return (
    <div
      className={`absolute inset-0 z-100 h-full flex flex-col items-center justify-center text-white text-center p-10`}
      style={{
        left: `${leftTableWidth}px`,
        right: `${rightTableWidth}px`,
      }}
    >
      <div className="text-2xl font-bold bg-amber-600 p-6">
        The contest is over. Top 30 can now come to the Circles booth to collect
        the prizes!
      </div>
    </div>
  );
}

export default function Winners(props: {
  leftTableWidth: number;
  rightTableWidth: number;
}) {
  const [show, setShow] = useState(Date.now() >= SHOW_WINNERS_TIMESTAMP);

  useEffect(() => {
    if (show) return;
    const timeout = setTimeout(
      () => setShow(true),
      SHOW_WINNERS_TIMESTAMP - Date.now()
    );

    return () => clearTimeout(timeout);
  }, [show]);

  if (!show) return null;
  return <WinnersInner {...props} />;
}
