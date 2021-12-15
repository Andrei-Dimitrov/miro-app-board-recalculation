export enum BoardStatuses {
  Ok = "success",
  Fail = "fail",
  Unknown = "unknown",
}

export const boardStatusMessages = {
  [BoardStatuses.Ok]: "Up to date",
  [BoardStatuses.Fail]: "Outdated",
  [BoardStatuses.Unknown]: "Unknown. Recalculate to update!",
};
