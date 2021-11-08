import { countStickersPoints, updateStatus, withinAllBounds, withinXBounds, withinYBounds } from "./helpers.js";

let frame;

const createBoardFrameSelectOptions = async () => {
  const select = document.getElementById("frame-select");
  const frames = await miro.board.widgets.get({ type: "frame" });

  frames.forEach((frame) => {
    select.options[select.options.length] = new Option(frame.title, frame.id);
  })

  select.addEventListener("change", async(ev) => {
    frame = await miro.board.widgets.get({ id: ev.target.value });
    console.debug('frame', frame);
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

  await updateStatus("ok");
}

miro.onReady(async () => {
  await createBoardFrameSelectOptions();

  const recalculateButton = document.getElementById("recalculate-button");

  recalculateButton.addEventListener("click", handleRecalculate)

  const handler = async (ev) => {
    console.debug('ev', ev);
    const itemId = ev.data[0]?.id;

    if (!frame) {
      console.error("No frame widget found, unable to update board status :(")
      return;
    }

    const item = itemId ? (await miro.board.widgets.get({ type: "sticker", id: itemId })).filter((item) => withinAllBounds(item, frame))[0] : undefined;

    if (!item) {
      console.error("No status widget found, unable to update board status :(")
      return;
    }

    await updateStatus("fail");
  };

  miro.addListener("WIDGETS_CREATED", handler)
  miro.addListener("WIDGETS_DELETED", handler)
  miro.addListener("WIDGETS_TRANSFORMATION_UPDATED", handler)
})
