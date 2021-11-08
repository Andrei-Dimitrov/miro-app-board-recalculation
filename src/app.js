async function init() {
  const [sticker] = await miro.board.widgets.create({
    type: 'sticker',
    text: 'Hello, World!',
  });

  await miro.board.viewport.zoomToObject(sticker);
}

miro.onReady(init);
