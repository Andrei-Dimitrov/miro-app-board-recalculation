import {
  countStickersPoints,
  handleStickersChange,
  updateStatus,
  withinAllBounds,
  withinXBounds,
  withinYBounds
} from "./helpers.js";

let frame;

const createBoardFrameSelectOptions = async () => {
  const select = document.getElementById("frame-select");
  const frames = await miro.board.widgets.get({ type: "frame" });

  frames.forEach((frame) => {
    select.options[select.options.length] = new Option(frame.title, frame.id);
  })

  select.addEventListener("change", async(ev) => {
    frame = (await miro.board.widgets.get({ id: ev.target.value }))[0];
    console.debug('frame', frame);

    const appId = miro.getClientId();

    if (frame.metadata[appId]?.status) {
      await updateStatus(frame.metadata[appId].status)
    }
  })
}

const handleRecalculate = async () => {
  if (!frame) {
    return;
  }

  const table = (await miro.board.widgets.get({ type: "grid"}))
    .filter(item => withinAllBounds(item, frame))[0];

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

  await updateStatus("ok", frame);
}

miro.onReady(async () => {
  await createBoardFrameSelectOptions();

  const recalculateButton = document.getElementById("recalculate-button");

  recalculateButton.addEventListener("click", handleRecalculate)

  const handler = handleStickersChange(frame)

  miro.addListener("WIDGETS_CREATED", handler)
  miro.addListener("WIDGETS_DELETED", handler)
  miro.addListener("WIDGETS_TRANSFORMATION_UPDATED", handler)
})
