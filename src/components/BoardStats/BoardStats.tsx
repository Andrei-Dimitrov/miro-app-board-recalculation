import cn from "classnames";
import type { IterationData } from "../../helpers";

export interface BoardStatsProps {
  data: IterationData[];
}

export const BoardStats = (props: BoardStatsProps) => {
  const { data } = props;

  if (!data.length) {
    return null;
  }

  const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div>
        <strong>Real time board stats</strong>
      </div>
      <span>Iterations:</span>
      <table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Velocity</td>
            <td>Load</td>
            <td>Diff</td>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((iteration, index) => (
            <tr
              key={index.toString()}
              className={cn(
                ".",
                iteration.load > iteration.velocity && "invalid",
              )}
            >
              <td>{iteration.name}</td>
              <td>{iteration.velocity}</td>
              <td>{iteration.load}</td>
              <td>{iteration.diff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
