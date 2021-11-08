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

export const updateStatus = async (newStatus, frame) => {
  const statusIcon = document.getElementById("board-status-icon")
  const statusMessage = document.getElementById("board-status-message")

  statusIcon.src = boardStatusIcons[newStatus];
  statusMessage.textContent = boardStatusMessages[newStatus];

  if (frame) {
    const appId = miro.getClientId();
    frame.metadata[appId] = { ...frame.metadata[appId], status: newStatus }

    await miro.board.widgets.update(frame);
  }
}
