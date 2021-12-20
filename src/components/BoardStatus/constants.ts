import successStatusIcon from "/static/successStatusIcon.svg?url";
import failStatusIcon from "/static/failStatusIcon.svg?url";
import unknownStatusIcon from "/static/unknownStatusIcon.svg?url";

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

export const boardStatusIcons = {
  [BoardStatuses.Ok]: successStatusIcon,
  [BoardStatuses.Fail]: failStatusIcon,
  [BoardStatuses.Unknown]: unknownStatusIcon,
};
