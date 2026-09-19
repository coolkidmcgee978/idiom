import { useAppContext } from '../../hooks/useAppContext';

function parseStatistics(statistics) {
  let { playedCount, guessCounts } = statistics;
  let winCount = guessCounts.reduce((p, c) => p + c, 0);
  let winRate = playedCount ? ((winCount / playedCount) * 100).toFixed(2) : 0;

  let totalGuessCount = guessCounts.reduce(
    (sum, count, i) => sum + count * (i + 1),
    0
  );
  let avgGuessCount =
    winCount > 0 ? (totalGuessCount / winCount).toFixed(2) : 0;

  return { playedCount, winRate, avgGuessCount };
}

function Summary(props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="flex flex-row gap-6">
        <div className="flex flex-col items-center">
          <div className="text-3xl">{props.playedCount}</div>
          <div className="text-xs">Played</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-3xl">{props.winRate}</div>
          <div className="text-xs">Win %</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-3xl">{props.avgGuessCount}</div>
          <div className="text-xs">Avg Guess</div>
        </div>
      </div>
    </div>
  );
}

function Distribution(props) {
  let guessCounts = props.guessCounts;
  let maxCount = Math.max(1, ...guessCounts);
  return (
    <div
      className="flex flex-col gap-2 w-11/12 max-w-[300px] pb-3"
      style={{
        fontFamily: '"Clear Sans", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {guessCounts.map((count, i) => {
        return (
          <div key={i} className="flex flex-row text-sm">
            <div className="grow-[1] pr-2 text-right">{i + 1} 次猜中</div>
            <div
              className="grow-[8]"
              style={{
                background: `linear-gradient(to right, #16a34a ${
                  (count / maxCount) * 100
                }%, #e5e7eb ${(count / maxCount) * 100}%)`,
              }}
            ></div>
            <div className="grow-[1] text-left pl-2 max-w-[2rem]">
              {count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Statistics(props) {
  let { config } = useAppContext();
  let statistics = props.statistics || {
    playedCount: 0,
    guessCounts: Array(config.maxAttempts).fill(0),
  };

  let { playedCount, winRate, avgGuessCount } = parseStatistics(statistics);

  return (
    <>
      <Summary
        playedCount={playedCount}
        winRate={winRate}
        avgGuessCount={avgGuessCount}
      />
      <Distribution guessCounts={statistics.guessCounts} />
    </>
  );
}