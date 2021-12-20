import cn from "classnames";
import type { IterationData } from "../../interfaces";

import classes from "./BoardStats.module.css";

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
    <div className={classes.wrapper}>
      <div>
        <strong>Real time board stats</strong>
      </div>
      <div className={classes.label}>Iterations:</div>
      <table>
        <thead>
          <tr>
            <td className={classes.cell}>Name</td>
            <td className={classes.cell}>Velocity</td>
            <td className={classes.cell}>Load</td>
            <td className={classes.cell}>Diff</td>
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
              <td className={classes.cell}>{iteration.name}</td>
              <td className={classes.cell}>{iteration.velocity}</td>
              <td className={classes.cell}>{iteration.load}</td>
              <td className={classes.cell}>{iteration.diff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
