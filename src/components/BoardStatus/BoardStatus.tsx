import { BoardStatuses } from "../../constants";

export interface BoardStatusProps {
  status: BoardStatuses;
}

export const BoardStatus = (props: BoardStatusProps) => {
  const { status } = props;

  return (
    <div>
      <strong>Board status:</strong>
      <div className="board-status-container">
        {status === BoardStatuses.Ok && (
          <>
            <img
              src="https://www.svgrepo.com/show/146075/question.svg"
              alt="Board status"
              id="board-status-icon"
            />
            <span id="board-status-message">Up to date.</span>
          </>
        )}
        {status === BoardStatuses.Fail && (
          <>
            <img
              src="https://www.svgrepo.com/show/146075/question.svg"
              alt="Board status"
              id="board-status-icon"
            />
            <span id="board-status-message">Outdated</span>
          </>
        )}
        {status === BoardStatuses.Unknown && (
          <>
            <img
              src="https://www.svgrepo.com/show/146075/question.svg"
              alt="Board status"
              id="board-status-icon"
            />
            <span id="board-status-message">
              Unknown. Recalculate to update!
            </span>
          </>
        )}
      </div>
    </div>
  );
};
