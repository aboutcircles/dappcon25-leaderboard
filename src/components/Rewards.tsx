export default function Rewards() {
  return (
    <div
      className="flex flex-col items-center justify-baseline text-white text-center p-2"
      style={{ fontSize: '0.5rem' }}
    >
      <div className="text-yellow-400">Rewards (for each leaderboard)</div>
      <div className="flex flex-row items-center justify-center gap-3">
        <p>🥇 300 EURe</p>
        <p>🥈 200 EURe</p>
        <p>🥉 100 EURe</p>
      </div>
      <div>#4-#10 50 EURe + T-shirt</div>
      <div>#11-#30 Mistery swag</div>
      <div>
        Top-3 winners also receive
        <br />a ETHCC Full Pass 😍
      </div>
    </div>
  );
}
