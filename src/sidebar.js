import {
  handleRecalculate,
  createBoardFrameSelectOptions,
  handleValidate,
  parseQuery,
} from "./helpers.js";

miro.onReady(async () => {
  await createBoardFrameSelectOptions();

  console.debug("window.location", parseQuery(window.location.search));

  const recalculateButton = document.getElementById("recalculate-button");

  recalculateButton.addEventListener("click", handleRecalculate);

  setInterval(handleValidate, 1000);

  miro.addListener("DATA_BROADCASTED", async (ev) => {
    const frameId = ev.data.frameId;
    if (frameId && ev.data.from === "main") {
      window.frame = (await miro.board.widgets.get({ id: frameId }))[0];

      const select = document.getElementById("frame-select");

      const option = Array.from(select.options).find(
        (option) => option.value === frameId,
      );

      if (option) {
        option.selected = true;
        select.dispatchEvent(new Event("change"));
      }
      console.debug("UPDATED FRAME ID IN SIDEBAR", ev.data.frameId);
    }
  });
});
