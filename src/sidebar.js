import {
  countStickersPoints,
  handleStickersChange,
  updateStatus,
  withinAllBounds,
  withinXBounds,
  withinYBounds
} from "./helpers.js";

const createBoardFrameSelectOptions = async () => {
  const select = document.getElementById("frame-select");
  const frames = await miro.board.widgets.get({ type: "frame" });

  frames.forEach((frame) => {
    select.options[select.options.length] = new Option(frame.title, frame.id);
  })

  select.addEventListener("change", async(ev) => {
    const frameId = ev.target.value;
    window.frame = (await miro.board.widgets.get({ id: frameId }))[0];
    console.debug('frame', window.frame);

    const appId = miro.getClientId();

    await updateStatus(window.frame?.metadata[appId]?.status ?? "unknown");

    await miro.broadcastData({ frameId, from: "sidebar" });
  })
}

const handleRecalculate = async () => {
  if (!window.frame) {
    return;
  }

  const table = (await miro.board.widgets.get({ type: "grid"}))
    .filter(item => withinAllBounds(item, window.frame))[0];

  const stickers = (await miro.board.widgets.get({ type: "sticker"}))
    .filter(item => withinAllBounds(item, table));

  const iterations = (await miro.board.widgets.get({ type: "shape"}))
    .filter(item => withinAllBounds(item, table)).filter((shape) => /vel: \d+\s+ld: \d+/i.test(shape.plainText))


  const features = (await miro.board.widgets.get({ type: "shape"}))
    .filter(item => withinAllBounds(item, table)).filter((shape) => /size: \d+/i.test(shape.plainText))

  // count iteration loads
  await Promise.all(iterations.map(async (shape) => {
    const stickersWithin = stickers.filter((item) => item !== shape && withinYBounds(item, shape));

    const count = countStickersPoints(stickersWithin);

    shape.text = shape.text.replace(/(ld: \d+)/i, `LD: ${count}`);

    console.debug(shape.text);

    await miro.board.widgets.update(shape);
  }))

  // count feature sizes
  await Promise.all(features.map(async (shape) => {
    const stickersWithin = stickers.filter((item) => item !== shape && withinXBounds(item, shape));

    const count = countStickersPoints(stickersWithin);

    shape.text = shape.text.replace(/(size: \d+)/i, `Size: ${count}`);

    console.debug(shape.text);

    await miro.board.widgets.update(shape);
  }))

  await updateStatus("ok");
}

miro.onReady(async () => {
  await createBoardFrameSelectOptions();

  const recalculateButton = document.getElementById("recalculate-button");

  recalculateButton.addEventListener("click", handleRecalculate)

  miro.addListener("WIDGETS_CREATED", handleStickersChange)
  miro.addListener("WIDGETS_DELETED", handleStickersChange)
  miro.addListener("WIDGETS_TRANSFORMATION_UPDATED", handleStickersChange)
  miro.addListener("DATA_BROADCASTED", async (ev) => {
    const frameId = ev.data.frameId;
    if (frameId && ev.data.from === "main") {
      window.frame = (await miro.board.widgets.get({ id: frameId }))[0]

      const select = document.getElementById("frame-select");

      const option = Array.from(select.options).find((option) => option.value === frameId);

      if (option) {
        option.selected = true;
        select.dispatchEvent(new Event("change"))
      }
      console.debug('UPDATED FRAME ID IN SIDEBAR', ev.data.frameId);
    }
  })
})
