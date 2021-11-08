const toolbarIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6L11.7711 8.84337M3 6V17L11.7711 20M3 6L11.7711 3L21 6M11.7711 8.84337V20M11.7711 8.84337L21 6M11.7711 20L21 17V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const libraryIcon = `<svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m6 12 17.542 5.687M6 12v22l17.542 6M6 12l17.542-6L42 12m-18.458 5.687V40m0-22.313L42 12M23.542 40 42 34V12" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

let frame;

const boardStatuses = {
  ok: "✔️️",
  fail: "❌",
};

const boardStatusStyles = {
  ok: {
    backgroundColor: "#8fd14f",
    borderColor: "transparent",
  },
  fail: {
    backgroundColor: "transparent",
    borderColor: "#f24726",
  }
}

const withinAllBounds = (item, parent) => (
  item.bounds.left >= parent.bounds.left
  && item.bounds.top >= parent.bounds.top
  && item.bounds.right <= parent.bounds.right
  && item.bounds.bottom <= parent.bounds.bottom
)

const withinYBounds = (item, parent) => (
  item.bounds.left >= parent.bounds.left
  && item.bounds.right <= parent.bounds.right
)

const withinXBounds = (item, parent) => (
  item.bounds.top >= parent.bounds.top
  && item.bounds.bottom <= parent.bounds.bottom
)

const countStickersPoints = (stickers) => stickers.reduce((acc, sticker) => {
  const points = Number(sticker.plainText.match(/\d+pt/)?.[0]?.slice(0, -2) ?? 0);

  return acc + points
}, 0)

const init = async () => {
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

  await updateStatus(boardStatuses.ok);
}

const updateStatus = async (newStatus) => {
  const okStatus = (await miro.board.widgets.get({ type: "shape", plainText: boardStatuses.ok }))[0];
  const failStatus = (await miro.board.widgets.get({ type: "shape", plainText: boardStatuses.fail }))[0];

  if (newStatus === boardStatuses.ok && !!failStatus) {
    failStatus.style = {...failStatus.style, ...boardStatusStyles.ok };
    failStatus.text = failStatus.text.replace(boardStatuses.fail, boardStatuses.ok);

    await miro.board.widgets.update(failStatus);
  }

  if (newStatus === boardStatuses.fail && !!okStatus) {
    okStatus.style = {...okStatus.style, ...boardStatusStyles.fail };
    okStatus.text = okStatus.text.replace(boardStatuses.ok, boardStatuses.fail);

    await miro.board.widgets.update(okStatus);
  }
}

miro.onReady(async () => {
  frame = (await miro.board.widgets.get({ type: "frame", title: "Codebots 2.0" }))[0];

  await miro.initialize({
    extensionPoints: {
      toolbar: {
        title: 'Recalculate the PIP board',
        toolbarSvgIcon: toolbarIcon,
        librarySvgIcon: libraryIcon,
        async onClick() {
          await init();
        },
      },
      bottomBar: {
        title: 'Recalculate the PIP board',
        svgIcon: toolbarIcon,
        async onClick() {
          await init();
        },
      },
    },
  });

  const handler = async (ev) => {
    console.debug('ev', ev);
    const itemId = ev.data[0]?.id;

    const item = itemId ? (await miro.board.widgets.get({ type: "sticker", id: itemId })).filter((item) => withinAllBounds(item, frame))[0] : undefined;

    if (!item) {
      console.error("No status widget found, unable to update board status :(")
      return;
    }

    await updateStatus(boardStatuses.fail);
  };

  miro.addListener("WIDGETS_CREATED", handler)
  miro.addListener("WIDGETS_DELETED", handler)
  miro.addListener("WIDGETS_TRANSFORMATION_UPDATED", handler)
});
