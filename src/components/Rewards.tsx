export default function Rewards() {
  return (
    <div className="flex flex-col items-center justify-baseline text-white text-center p-2 text-sm">
      <div className="text-yellow-400 font-bold">
        Rewards (for each leaderboard)
      </div>
      <div className="flex flex-row items-center justify-center gap-2 mb-2 text-left">
        <div className="flex flex-row no-wrap items-center">
          <span className="text-2xl">🥇</span>
          <div className="flex flex-col items-start">
            <span className="">500 EURe</span>
            <span>+ special swag</span>
          </div>
        </div>
        <div className="flex flex-row no-wrap items-center">
          <span className="text-2xl">🥈</span>
          <div className="flex flex-col items-start">
            <span className="">250 EURe</span>
            <span>+ special swag</span>
          </div>
        </div>
        <div className="flex flex-row no-wrap items-center">
          <span className="text-2xl">🥉</span>
          <div className="flex flex-col items-start">
            <span className="">100 EURe</span>
            <span>+ special swag</span>
          </div>
        </div>
      </div>
      <div>
        <span className="font-bold">#4-#10:</span> 50 EURe + swag
      </div>
      <div>
        <span className="font-bold">#11-#20:</span> swag
      </div>
    </div>
  );
}
