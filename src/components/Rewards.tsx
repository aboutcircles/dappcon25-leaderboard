export default function Rewards() {
  return (
    <div
      className="flex flex-col items-center justify-baseline text-white text-center p-2"
      style={{ fontSize: '0.5rem' }}
    >
      <div className="text-yellow-400">Rewards (for each leaderboard)</div>
      <div className="flex flex-row items-center justify-center gap-2 mb-2">
        <p className="flex flex-row no-wrap items-baseline">
          <span className="text-2xl">🥇</span> 300 EURe
        </p>
        <p className="flex flex-row no-wrap items-baseline">
          <span className="text-2xl">🥈</span> 200 EURe
        </p>
        <p className="flex flex-row no-wrap items-baseline">
          <span className="text-2xl">🥉</span> 100 EURe
        </p>
      </div>
      <div>#4-#10 50 EURe + T-shirt</div>
      <div>#11-#30 Mystery swag</div>
      <div>
        Top-3 winners also receive
        <br />a ETHCC Full Pass 😍
      </div>
    </div>
  );
}
