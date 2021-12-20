import type { BoardStatuses } from "./constants";
import { boardStatusIcons, boardStatusMessages } from "./constants";

import classes from "./BoardStatus.module.css";

export interface BoardStatusProps {
  status: BoardStatuses;
}

export const BoardStatus = (props: BoardStatusProps) => {
  const { status } = props;

  return (
    <div className={classes.wrapper}>
      <strong>Board status:</strong>
      <div className={classes.container}>
        <img
          src={boardStatusIcons[status]}
          alt="Board status"
          className={classes.icon}
        />
        <span>{boardStatusMessages[status]}</span>
      </div>
    </div>
  );
};
