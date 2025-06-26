import { MIN_CIRCLES_TO_JOIN } from '@/const';
import Countdown from './Countdown';

export default function Instructions() {
  return (
    <div className="flex flex-col items-center justify-center text-white shrink px-2 text-sm max-w-xl">
      <h5 className="text-yellow-400 font-bold px-2">Instructions & Rules</h5>
      <ol className="list-decimal mt-1">
        <li>
          {`Scan the QR code on screen and send ${MIN_CIRCLES_TO_JOIN} CRC to join the competition.`}
        </li>
        <li>
          An invite is counted when you invite someone and they accept your
          invite.
        </li>
        <li>
          You need a minimum of 3 invites to be eligible for prizes regardless
          of the ranking.
        </li>
        <li>
          Mutual Trust is when you trust someone and they trust you back. This
          counts as one mutual trust.
        </li>
        <li>
          You need a minimum of 5 mutual trusts to be eligible for prizes
          regardless of the ranking.
        </li>
        <li>
          Users untrusting after the competition is over will be disqualified
        </li>
      </ol>
      <Countdown />
    </div>
  );
}
