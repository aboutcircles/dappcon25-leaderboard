import React, { useEffect, useState } from 'react';
import { SHOW_WINNERS_TIMESTAMP } from '@/const';
import { useInvitesStore } from '@/stores/invitesStore';
import { useTrustsStore } from '@/stores/trustsStore';

function captureAndPrintWinners() {
  try {
    // Get data from stores
    const inviteScores = useInvitesStore.getState().invitesScores;
    const trustScores = useTrustsStore.getState().trustsScores;
    const invites = useInvitesStore.getState().invitesStats;
    const trusts = useTrustsStore.getState().trustsStats;

    // Print invite winners
    console.log('\n\n===== TOP 30 INVITE WINNERS =====');
    inviteScores.slice(0, 30).forEach((profile, idx) => {
      const score = invites[profile.address]?.invitesRedeemed || 0;
      if (score > 0) {
        console.log(
          `#${idx + 1}: ${profile.name} (${profile.address}) - ${score} invites`
        );
      }
    });

    // Print trust winners
    console.log('\n===== TOP 30 TRUST WINNERS =====');
    trustScores.slice(0, 30).forEach((profile, idx) => {
      const score = trusts[profile.address]?.trusts || 0;
      if (score > 0) {
        console.log(
          `#${idx + 1}: ${profile.name} (${profile.address}) - ${score} trusts`
        );
      }
    });
    console.log('\n');

    // Format data for JSON file
    const currentDate = new Date();
    const snapshot = {
      event: 'DappCon 25 Circles Leaderboard',
      captureTime: currentDate.toISOString(),
      captureDate: currentDate.toLocaleString(),
      totalInviteWinners: inviteScores.filter(
        p => (invites[p.address]?.invitesRedeemed || 0) > 0
      ).length,
      totalTrustWinners: trustScores.filter(
        p => (trusts[p.address]?.trusts || 0) > 0
      ).length,
      inviteWinners: inviteScores
        .slice(0, 30)
        .map((profile, idx) => ({
          rank: idx + 1,
          address: profile.address,
          name: profile.name || 'Unknown',
          score: invites[profile.address]?.invitesRedeemed || 0,
          profileUrl: `https://app.metri.xyz/${profile.address}`,
        }))
        .filter(w => w.score > 0),
      trustWinners: trustScores
        .slice(0, 30)
        .map((profile, idx) => ({
          rank: idx + 1,
          address: profile.address,
          name: profile.name || 'Unknown',
          score: trusts[profile.address]?.trusts || 0,
          profileUrl: `https://app.metri.xyz/${profile.address}`,
        }))
        .filter(w => w.score > 0),
    };

    // Create formatted JSON string
    const dataStr = JSON.stringify(snapshot, null, 2);

    // Save to localStorage as backup
    localStorage.setItem('dappcon25Winners', dataStr);
    console.log('Winners data saved to localStorage. To retrieve:');
    console.log(
      'console.log(JSON.parse(localStorage.getItem("dappcon25Winners")))'
    );

    // Create download link
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Format date for filename
    const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    link.download = `dappcon25-winners-${dateStr}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    console.log(`Winners data downloaded as ${link.download}`);
    return true;
  } catch (error) {
    console.error('Error capturing winners:', error);
    return false;
  }
}

function WinnersInner({
  leftTableWidth,
  rightTableWidth,
}: {
  leftTableWidth: number;
  rightTableWidth: number;
}) {
  // When this component mounts, capture and print the winners
  useEffect(() => {
    // Check if we've already captured the winners
    const captured = localStorage.getItem('winnersCapture');

    if (!captured) {
      console.log('Capturing winners data in 2 seconds...');
      const timer = setTimeout(() => {
        const success = captureAndPrintWinners();
        if (success) {
          localStorage.setItem('winnersCapture', 'true');
        }
      }, 2000); // Short delay to ensure data is loaded

      return () => clearTimeout(timer);
    } else {
      console.log('Winners were already captured.');
      console.log(
        'To capture again, run in console: localStorage.removeItem("winnersCapture") and refresh'
      );
    }
  }, []);

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
