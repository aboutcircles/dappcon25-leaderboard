export default function Rewards() {
  return (
    <div className="flex flex-col items-center justify-baseline text-white text-center p-2 text-sm">
      <div className="text-yellow-400 font-bold">
        Rewards (for each leaderboard)
      </div>
      <div className="flex flex-row items-center justify-center gap-2 mb-2 font-bold text-left">
        <p className="flex flex-row no-wrap items-end">
          <span className="text-2xl">🥇</span>
          <span className="pb-1">300 EURe</span>
        </p>
        <p className="flex flex-row no-wrap items-end">
          <span className="text-2xl">🥈</span>
          <span className="pb-1">200 EURe</span>
        </p>
        <p className="flex flex-row no-wrap items-end">
          <span className="text-2xl">🥉</span>
          <span className="pb-1">100 EURe</span>
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
