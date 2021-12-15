import { boardStatusIcons, boardStatusMessages } from "./constants";
import type { IFrameWidget, IStickerWidget, IWidget } from "./interfaces";
import {
  getFrameWidget,
  getFrameWidgets,
  getShapeWidgets,
  getStickerWidgets,
  updateWidgets,
} from "./miroHelpers";

export const isWithinColumn = (item: IWidget, parent: IWidget) =>
  item.bounds.left >= parent.bounds.left &&
  item.bounds.right <= parent.bounds.right;

export const isWithinRow = (item: IWidget, parent: IWidget) =>
  item.bounds.top >= parent.bounds.top &&
  item.bounds.bottom <= parent.bounds.bottom;

export const isWithinCell = (item: IWidget, parent: IWidget) =>
  isWithinColumn(item, parent) && isWithinRow(item, parent);

export const isRoughlyWithinColumn = (item: IWidget, parent: IWidget) => {
  if (isWithinColumn(item, parent)) {
    return true;
  }

  const itemCenter = item.bounds.width / 2;

  // case when the item is almost inside the parent from the left side: [ |    ] |
  // where: [ ] - item, | | - parent
  if (
    item.bounds.left <= parent.bounds.left &&
    item.bounds.right >= parent.bounds.left &&
    item.bounds.right <= parent.bounds.right
  ) {
    return item.bounds.right - parent.bounds.left >= itemCenter;
  }

  // case when the item is almost inside the parent from the right side: | [    | ]
  // where: [ ] - item, | | - parent
  if (
    item.bounds.left >= parent.bounds.left &&
    item.bounds.left <= parent.bounds.right &&
    item.bounds.right >= parent.bounds.right
  ) {
    return parent.bounds.right - item.bounds.left >= itemCenter;
  }

  return false;
};

export const isRoughlyWithinRow = (item: IWidget, parent: IWidget) => {
  if (isWithinRow(item, parent)) {
    return true;
  }

  const itemCenter = item.bounds.height / 2;

  // case when the item is almost inside the parent from the top side
  if (
    item.bounds.top <= parent.bounds.top &&
    item.bounds.bottom >= parent.bounds.top &&
    item.bounds.bottom <= parent.bounds.bottom
  ) {
    return item.bounds.bottom - parent.bounds.top >= itemCenter;
  }

  // case when the item is almost inside the parent from the bottom side
  if (
    item.bounds.bottom >= parent.bounds.bottom &&
    item.bounds.top <= parent.bounds.bottom &&
    item.bounds.top >= parent.bounds.top
  ) {
    return parent.bounds.bottom - item.bounds.top >= itemCenter;
  }

  return false;
};

export const parseQuery = (query: string) =>
  query
    .slice(1)
    .split("&")
    .reduce((acc, param) => {
      const [key, value] = param.split("=");
      return { ...acc, [key]: decodeURIComponent(value) };
    }, {} as { frameId?: string });

export const countStickersPoints = (stickers: IStickerWidget[]) =>
  stickers.reduce((acc, sticker) => {
    const points = Number(
      sticker.plainText.match(/(?<points>\d+)pt/)?.groups?.points ?? 0,
    );

    return acc + points;
  }, 0);

export const updateStatus = async (
  newStatus: keyof typeof boardStatusIcons,
) => {
  const statusIcon = document.getElementById(
    "board-status-icon",
  ) as HTMLImageElement | null;
  const statusMessage = document.getElementById("board-status-message");

  if (!statusIcon || !statusMessage) {
    return;
  }

  statusIcon.src = boardStatusIcons[newStatus];
  statusMessage.textContent = boardStatusMessages[newStatus];
};

export interface IterationData {
  name: string,
  velocity: number;
  load: number;
  diff: number;
}

export const createBoardStats = (
  iterationStats: Record<string, IterationData> = {},
) => {
  const boardStatsElement = document.getElementById("board-stats");

  if (boardStatsElement?.classList.contains("hidden")) {
    boardStatsElement.classList.remove("hidden");
  }

  const iterationTableElement = document.getElementById("iteration-table");

  if (!iterationTableElement) {
    return;
  }

  iterationTableElement.innerHTML = "";

  Object.entries(iterationStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([iterationName, iteration]) => {
      const rowElement = document.createElement("tr");

      const nameElement = document.createElement("td");
      nameElement.textContent = iterationName;

      const velocityElement = document.createElement("td");
      velocityElement.textContent = iteration.velocity.toString();

      const loadElement = document.createElement("td");
      loadElement.textContent = iteration.load.toString();

      const diffElement = document.createElement("td");
      diffElement.textContent = iteration.diff.toString();

      if (iteration.load > iteration.velocity) {
        rowElement.style.color = "#f00";
      }

      rowElement.appendChild(nameElement);
      rowElement.appendChild(velocityElement);
      rowElement.appendChild(loadElement);
      rowElement.appendChild(diffElement);

      iterationTableElement.appendChild(rowElement);
    });
};

export const createBoardFrameSelectOptions = async () => {
  const select = document.getElementById(
    "frame-select",
  ) as HTMLSelectElement | null;
  const frames = await getFrameWidgets();

  if (!select) {
    return;
  }

  frames.forEach((frame) => {
    select.options[select.options.length] = new Option(frame.title, frame.id);
  });

  select.addEventListener("change", async (ev) => {
    const frameId = (ev.target as HTMLSelectElement).value;
    window.frame = await getFrameWidget(frameId);
    const recalculateButton = document.getElementById(
      "recalculate-button",
    ) as HTMLButtonElement;
    const exportButton = document.getElementById(
      "export-button",
    ) as HTMLButtonElement;

    if (!recalculateButton || !exportButton) {
      return;
    }

    if (recalculateButton.disabled) {
      recalculateButton.disabled = false;
    }
    if (exportButton.disabled) {
      exportButton.disabled = false;
    }

    await updateStatus("unknown");

    await miro.broadcastData({ frameId, from: "sidebar" });
  });
};

export const getBoardData = async (frame: IFrameWidget) => {
  const allStickers = await getStickerWidgets();

  const stickers = allStickers.filter((item) => isWithinCell(item, frame));

  const allShapes = await getShapeWidgets();

  const iterations = allShapes
    .filter((item) => isWithinCell(item, frame))
    .filter((shape) => /vel: \d+\s+ld: \d+/i.test(shape.plainText));

  const features = allShapes
    .filter((item) => isWithinCell(item, frame))
    .filter((shape) => /size: \d+/i.test(shape.plainText));

  return {
    stickers,
    iterations,
    features,
  };
};

export const handleRecalculate = async () => {
  if (!window.frame) {
    return;
  }

  const { stickers, iterations, features } = await getBoardData();

  // count iteration loads
  await Promise.all(
    iterations.map(async (iteration) => {
      const stickersWithin = stickers.filter(
        (item) =>
          item.id !== iteration.id && isRoughlyWithinColumn(item, iteration),
      );

      const load = countStickersPoints(stickersWithin);

      const velocity = Number(
        iteration.text.match(/vel: (?<vel>\d+)/i)?.groups?.vel ?? 0,
      );

      iteration.text = iteration.text.replace(/(ld: \d+)/i, `LD: ${load}`);
      if (load > velocity) {
        iteration.style.textColor = "#ff0000";
      } else {
        iteration.style.textColor = "#ffffff";
      }

      await updateWidgets({
        id: iteration.id,
        text: iteration.text,
        style: iteration.style,
      });
    }),
  );

  // count feature sizes
  await Promise.all(
    features.map(async (feature) => {
      const stickersWithin = stickers.filter(
        (item) => item.id !== feature.id && isRoughlyWithinRow(item, feature),
      );

      const count = countStickersPoints(stickersWithin);

      feature.text = feature.text.replace(/(size: \d+)/i, `Size: ${count}`);

      await updateWidgets({
        id: feature.id,
        text: feature.text,
      });
    }),
  );

  await updateStatus("ok");
};

export const handleValidate = async () => {
  if (!window.frame) {
    return;
  }

  const { stickers, iterations, features } = await getBoardData();

  const iterationStats: Record<string, IterationData> = {};
  // count iteration loads
  const isIterationsValid = iterations.reduce((acc, iteration) => {
    const stickersWithin = stickers.filter(
      (item) =>
        item.id !== iteration.id && isRoughlyWithinColumn(item, iteration),
    );

    const actualLoad = countStickersPoints(stickersWithin);

    const iterationName =
      iteration.text.match(/(?<name>I\d\.\d)/i)?.groups?.name;

    const iterationVelocity = Number(
      iteration.text.match(/vel: (?<count>\d+)/i)?.groups?.count ?? 0,
    );
    const iterationLoad = Number(
      iteration.text.match(/ld: (?<count>\d+)/i)?.groups?.count ?? 0,
    );

    const iterationDiff = Math.abs(iterationVelocity - actualLoad);

    if (iterationName) {
      iterationStats[iterationName] = {
        velocity: iterationVelocity,
        load: actualLoad,
        diff: iterationDiff,
      };
    }

    return acc && actualLoad === iterationLoad;
  }, true);

  // count feature sizes
  const isFeaturesValid = features.every((feature) => {
    const stickersWithin = stickers.filter(
      (item) => item.id !== feature.id && isRoughlyWithinRow(item, feature),
    );

    const count = countStickersPoints(stickersWithin);

    const featureCount = Number(
      feature.text.match(/size: (?<count>\d+)/i)?.groups?.count ?? 0,
    );

    return count === featureCount;
  });

  if (isIterationsValid && isFeaturesValid) {
    await updateStatus("ok");
  } else {
    await updateStatus("fail");
  }

  await createBoardStats(iterationStats);
};

export const createAndDownloadCSV = async () => {
  if (!window.frame) {
    return;
  }

  const headers = ["Display Color", "Name", "Unified Parent", "Plan Estimate"];

  const { stickers, iterations, features } = await getBoardData();

  const rows = [];

  // really complicated nested loop, sorry :(
  for (const feature of features) {
    const featureStickers = stickers.filter(
      (item) => item.id !== feature.id && isRoughlyWithinRow(item, feature),
    );

    for (const sticker of featureStickers) {
      for (const iteration of iterations) {
        const isStickerInIteration = isRoughlyWithinColumn(sticker, iteration);

        if (!isStickerInIteration) {
          continue;
        }

        const iterationName =
          iteration.plainText.match(/(?<name>I\d\.\d)/i)?.groups?.name ?? "";
        const stickerText = sticker.plainText ?? "Unknown text";

        const displayColor = feature.style?.backgroundColor ?? "#808080";

        const name = `${iterationName} ${stickerText.replace(
          /(\d+pt)/,
          "",
        )}`.trim();

        const unifiedParent =
          feature.plainText.match(/(?<feat>F\d+)/i)?.groups?.feat ?? "";

        const planEstimate =
          sticker.plainText.match(/(?<points>\d+)pt/)?.groups?.points ?? "";

        if (!planEstimate || !unifiedParent) {
          continue;
        }

        const row = [displayColor, name, unifiedParent, planEstimate];

        rows.push(row);
      }
    }
  }

  const csvData = `data:text/csv;base64,${btoa(
    [headers, ...rows].map((row) => row.join(",")).join("\n"),
  )}`;

  const encodedUri = encodeURI(csvData);

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", encodedUri);
  linkElement.setAttribute(
    "download",
    `${window.frame.title ?? "Board data"}.csv`,
  );

  linkElement.click();

  const exportWarning = document.getElementById("export-warning");
  exportWarning?.classList.remove("hidden");
};
