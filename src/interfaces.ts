import type { Dispatch, SetStateAction } from "react";
import type { SDK } from "../typings/miro";

export type IWidget = SDK.IWidget;
export type IStickerWidget = SDK.IStickerWidget;
export type IShapeWidget = SDK.IShapeWidget;
export type IFrameWidget = SDK.IFrameWidget;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export interface IterationData {
  name: string;
  velocity: number;
  load: number;
  diff: number;
}
