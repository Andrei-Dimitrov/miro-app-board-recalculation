import { countStickersPoints, updateStatus, withinAllBounds, withinXBounds, withinYBounds } from "./helpers.js";
import { boardStatuses, libraryIcon, toolbarIcon } from "./constants.js";

let frame;

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

miro.onReady(async () => {
  const path = window.location.pathname.replace("/index.html", "");

  frame = (await miro.board.widgets.get({ type: "frame", title: "Codebots 2.0" }))[0];

  await miro.initialize({
    extensionPoints: {
      toolbar: {
        title: 'Recalculate the PIP board',
        toolbarSvgIcon: toolbarIcon,
        librarySvgIcon: libraryIcon,
        async onClick() {
          await miro.board.ui.openLeftSidebar(`${path}/sidebar.html`)
        },
      },
      bottomBar: {
        title: 'Recalculate the PIP board',
        svgIcon: toolbarIcon,
        async onClick() {
         await miro.board.ui.openLeftSidebar(`${path}/sidebar.html`)
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

  // miro.addListener("WIDGETS_CREATED", handler)
  // miro.addListener("WIDGETS_DELETED", handler)
  // miro.addListener("WIDGETS_TRANSFORMATION_UPDATED", handler)
});
