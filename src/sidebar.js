import {
  handleRecalculate,
  createBoardFrameSelectOptions,
  handleValidate,
  parseQuery,
  createAndDownloadCSV,
} from "./helpers.js";

miro.onReady(async () => {
  await createBoardFrameSelectOptions();

  const { frameId } = parseQuery(window.location.search);

  const recalculateButton = document.getElementById("recalculate-button");

  recalculateButton.addEventListener("click", handleRecalculate);

  const exportButton = document.getElementById("export-button");

  exportButton.addEventListener("click", createAndDownloadCSV);

  setInterval(handleValidate, 1000);

  // restore previously selected frame
  if (frameId) {
    window.frame = (await miro.board.widgets.get({ id: frameId }))[0];

    const select = document.getElementById("frame-select");

    const option = Array.from(select.options).find(
      (option) => option.value === frameId,
    );

    if (option) {
      option.selected = true;
      select.dispatchEvent(new Event("change"));
    }
  }
});
