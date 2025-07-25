import Countdown from './Countdown';

export default function Instructions() {
  return (
    <div
      className="flex flex-col items-center justify-center text-white shrink px-2"
      style={{ fontSize: '0.5rem' }}
    >
      <h5>Instructions & Rules</h5>
      <ol
        className="list-decimal mt-1"
        style={{ fontSize: '0.5rem', fontFamily: 'monospace' }}
      >
        <li>
          An invite is counted when you invite someone and they accept your
          invite.{' '}
        </li>
        <li>
          You need a minimum of 5 invites to be eligible for prizes regardless
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
      </ol>
      <Countdown />
    </div>
  );
}
