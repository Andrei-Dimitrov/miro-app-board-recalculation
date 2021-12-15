import type { SDK } from "./miro";

declare global {
  export interface Window {
    frame?: SDK.IFrameWidget | undefined;
  }
}
