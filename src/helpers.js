import { boardStatuses, boardStatusStyles } from "./constants";

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
  const okStatus = (await miro.board.widgets.get({ type: "shape", plainText: boardStatuses.ok }))[0];
  const failStatus = (await miro.board.widgets.get({ type: "shape", plainText: boardStatuses.fail }))[0];

  console.debug('okStatus, failStatus', okStatus, failStatus);
  if (newStatus === boardStatuses.ok && !!failStatus) {
    failStatus.style = {...failStatus.style, ...boardStatusStyles.ok };
    failStatus.text = failStatus.text.replace(boardStatuses.fail, boardStatuses.ok);

    console.debug('Updated status Ok to Fail');
    await miro.board.widgets.update(failStatus);
  }

  if (newStatus === boardStatuses.fail && !!okStatus) {
    okStatus.style = {...okStatus.style, ...boardStatusStyles.fail };
    okStatus.text = okStatus.text.replace(boardStatuses.ok, boardStatuses.fail);

    console.debug('Updated status Fail to Ok');
    await miro.board.widgets.update(okStatus);
  }
}
