import ReactDOM from "react-dom";
import {
  handleRecalculate,
  createBoardFrameSelectOptions,
  handleValidate,
  parseQuery,
  createAndDownloadCSV,
} from "./helpers";
import { getFrameWidget } from "./miroHelpers";
import { App } from "./App";

miro.onReady(async () => {
  ReactDOM.render(<App />, document.getElementById("root"));

  // await createBoardFrameSelectOptions();
  //
  // const { frameId } = parseQuery(window.location.search);
  //
  // const recalculateButton = document.getElementById("recalculate-button");
  //
  // recalculateButton?.addEventListener("click", handleRecalculate);
  //
  // const exportButton = document.getElementById("export-button");
  //
  // exportButton?.addEventListener("click", createAndDownloadCSV);
  //
  // setInterval(handleValidate, 1000);
  //
  // // restore previously selected frame
  // if (frameId) {
  //   window.frame = await getFrameWidget(frameId);
  //
  //   const select = document.getElementById(
  //     "frame-select",
  //   ) as HTMLSelectElement | null;
  //
  //   const option = Array.from(select?.options ?? []).find(
  //     (option) => option.value === frameId,
  //   );
  //
  //   if (option) {
  //     option.selected = true;
  //     select?.dispatchEvent(new Event("change"));
  //   }
  // }
});
