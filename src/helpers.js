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

  const prevStatus = newStatus === boardStatuses.ok ? boardStatusIcons.fail : boardStatusIcons.ok;

  statusIcon.src = statusIcon.src.replace(prevStatus, newStatus);
  statusMessage.textContent = newStatus === boardStatuses.ok ? boardStatusMessages.ok : boardStatusMessages.fail;
}
