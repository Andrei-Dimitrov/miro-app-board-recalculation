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

    await updateStatus("unknown");

    await miro.broadcastData({ frameId, from: "sidebar" });
  })
}

export const getBoardData = async () => {
  const stickers = (await miro.board.widgets.get({ type: "sticker"}))
    .filter(item => withinAllBounds(item, window.frame));

  const iterations = (await miro.board.widgets.get({ type: "shape"}))
    .filter(item => withinAllBounds(item, window.frame)).filter((shape) => /vel: \d+\s+ld: \d+/i.test(shape.plainText))

  const features = (await miro.board.widgets.get({ type: "shape"}))
    .filter(item => withinAllBounds(item, window.frame)).filter((shape) => /size: \d+/i.test(shape.plainText))

  return {
    stickers,
    iterations,
    features,
  }
}

export const handleRecalculate = async () => {
  if (!window.frame) {
    return;
  }

  const { stickers, iterations, features } = await getBoardData();

  // count iteration loads
  await Promise.all(iterations.map(async (iteration) => {
    const stickersWithin = stickers.filter((item) => item !== iteration && withinYBounds(item, iteration));

    const count = countStickersPoints(stickersWithin);

    iteration.text = iteration.text.replace(/(ld: \d+)/i, `LD: ${count}`);

    console.debug(iteration.text);

    await miro.board.widgets.update(iteration);
  }))

  // count feature sizes
  await Promise.all(features.map(async (feature) => {
    const stickersWithin = stickers.filter((item) => item !== feature && withinXBounds(item, feature));

    const count = countStickersPoints(stickersWithin);

    feature.text = feature.text.replace(/(size: \d+)/i, `Size: ${count}`);

    console.debug(feature.text);

    await miro.board.widgets.update(feature);
  }))

  await updateStatus("ok");
}

export const handleValidate = async () => {
  if (!window.frame) {
    return;
  }

  const { stickers, iterations, features } = await getBoardData();

  // count iteration loads
  const isIterationsValid = iterations.every((iteration) => {
    const stickersWithin = stickers.filter((item) => item !== iteration && withinYBounds(item, iteration));

    const count = countStickersPoints(stickersWithin);

    const iterationCount = Number(iteration.text.match(/ld: (?<count>\d+)/i)?.groups.count ?? 0);

    return count === iterationCount;
  })

  // count feature sizes
  const isFeaturesValid = features.every((feature) => {
    const stickersWithin = stickers.filter((item) => item !== feature && withinXBounds(item, feature));

    const count = countStickersPoints(stickersWithin);

    const featureCount = Number(feature.text.match(/size: (?<count>\d+)/i)?.groups.count ?? 0);

    return count === featureCount;
  })

  if (isIterationsValid && isFeaturesValid) {
    await updateStatus("ok");
  } else {
    await updateStatus("fail");
  }
}
