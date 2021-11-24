import { boardStatusIcons, boardStatusMessages } from "./constants.js";

export const withinYBounds = (item, parent) => (
  item.bounds.left >= parent.bounds.left
  && item.bounds.right <= parent.bounds.right
)

export const withinXBounds = (item, parent) => (
  item.bounds.top >= parent.bounds.top
  && item.bounds.bottom <= parent.bounds.bottom
)

export const withinAllBounds = (item, parent) => withinYBounds(item ,parent) && withinXBounds(item, parent);

export const countStickersPoints = (stickers) => stickers.reduce((acc, sticker) => {
  const points = Number(sticker.plainText.match(/\d+pt/)?.[0]?.slice(0, -2) ?? 0);

  return acc + points
}, 0)

export const updateStatus = async (newStatus) => {
  const statusIcon = document.getElementById("board-status-icon")
  const statusMessage = document.getElementById("board-status-message")

  statusIcon.src = boardStatusIcons[newStatus];
  statusMessage.textContent = boardStatusMessages[newStatus];

  if (window.frame) {
    const appId = miro.getClientId();
    window.frame.metadata[appId] = { ...window.frame.metadata[appId], status: newStatus }

    // await miro.board.widgets.update(window.frame);
  }
}

export const createBoardFrameSelectOptions = async () => {
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

export const handleRecalculate = async () => {
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

export const handleValidate = async () => {
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
  const isIterationsValid = iterations.every((iteration) => {
    const stickersWithin = stickers.filter((item) => item !== iteration && withinYBounds(item, iteration));

    const count = countStickersPoints(stickersWithin);

    const iterationCount = Number(iteration.text.match(/ld: (?<count>\d+)/i)?.groups.count ?? 0);

    console.debug('count, iterationCount', count, iterationCount);
    return count === iterationCount;
  })

  // count feature sizes
  const isFeaturesValid = features.every((feature) => {
    const stickersWithin = stickers.filter((item) => item !== feature && withinXBounds(item, feature));

    const count = countStickersPoints(stickersWithin);

    const featureCount = Number(feature.text.match(/size: (?<count>\d+)/i)?.groups.count ?? 0);

    console.debug('count, featureCount', count, featureCount);
    return count === featureCount;
  })

  console.debug('isIterationsValid, isFeaturesValid', isIterationsValid, isFeaturesValid);

  if (isIterationsValid && isFeaturesValid) {
    await updateStatus("ok");
  } else {
    await updateStatus("fail");
  }
}
