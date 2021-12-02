import { boardStatusIcons, boardStatusMessages } from "./constants.js";

export const isWithinColumn = (item, parent) =>
  item.bounds.left >= parent.bounds.left &&
  item.bounds.right <= parent.bounds.right;

export const isWithinRow = (item, parent) =>
  item.bounds.top >= parent.bounds.top &&
  item.bounds.bottom <= parent.bounds.bottom;

export const isWithinCell = (item, parent) =>
  isWithinColumn(item, parent) && isWithinRow(item, parent);

export const isRoughlyWithinColumn = (item, parent) => {
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

export const isRoughlyWithinRow = (item, parent) => {
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

export const parseQuery = (query) =>
  query
    .slice(1)
    .split("&")
    .reduce((acc, param) => {
      const [key, value] = param.split("=");
      return { ...acc, [key]: decodeURIComponent(value) };
    }, {});

export const countStickersPoints = (stickers) =>
  stickers.reduce((acc, sticker) => {
    const points = Number(
      sticker.plainText.match(/(?<points>\d+)pt/)?.groups.points ?? 0,
    );

    return acc + points;
  }, 0);

export const updateStatus = async (newStatus) => {
  const statusIcon = document.getElementById("board-status-icon");
  const statusMessage = document.getElementById("board-status-message");

  statusIcon.src = boardStatusIcons[newStatus];
  statusMessage.textContent = boardStatusMessages[newStatus];
};

export const createBoardStats = async (iterationStats = {}) => {
  if (!window.frame) {
    return;
  }

  const boardStatsElement = document.getElementById("board-stats");

  if (boardStatsElement.classList.contains("hidden")) {
    boardStatsElement.classList.remove("hidden");
  }

  const iterationTableElement = document.getElementById("iteration-table");

  iterationTableElement.innerHTML = "";

  Object.entries(iterationStats).forEach(([iterationName, iteration]) => {
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
  const select = document.getElementById("frame-select");
  const frames = await miro.board.widgets.get({ type: "frame" });

  frames.forEach((frame) => {
    select.options[select.options.length] = new Option(frame.title, frame.id);
  });

  select.addEventListener("change", async (ev) => {
    const frameId = ev.target.value;
    window.frame = (await miro.board.widgets.get({ id: frameId }))[0];
    const recalculateButton = document.getElementById("recalculate-button");

    if (recalculateButton.disabled) {
      recalculateButton.disabled = false;
    }

    await updateStatus("unknown");

    await miro.broadcastData({ frameId, from: "sidebar" });
  });
};

export const getBoardData = async () => {
  const stickers = (await miro.board.widgets.get({ type: "sticker" })).filter(
    (item) => isWithinCell(item, window.frame),
  );

  const iterations = (await miro.board.widgets.get({ type: "shape" }))
    .filter((item) => isWithinCell(item, window.frame))
    .filter((shape) => /vel: \d+\s+ld: \d+/i.test(shape.plainText));

  const features = (await miro.board.widgets.get({ type: "shape" }))
    .filter((item) => isWithinCell(item, window.frame))
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
        (item) => item !== iteration && isRoughlyWithinColumn(item, iteration),
      );

      const load = countStickersPoints(stickersWithin);

      const velocity = Number(
        iteration.text.match(/vel: (?<vel>\d+)/i)?.groups.vel ?? 0,
      );

      iteration.text = iteration.text.replace(/(ld: \d+)/i, `LD: ${load}`);

      if (load > velocity) {
        iteration.style.textColor = "#f00";
      } else {
        iteration.style.textColor = "#fff";
      }

      await miro.board.widgets.update(iteration);
    }),
  );

  // count feature sizes
  await Promise.all(
    features.map(async (feature) => {
      const stickersWithin = stickers.filter(
        (item) => item !== feature && isRoughlyWithinRow(item, feature),
      );

      const count = countStickersPoints(stickersWithin);

      feature.text = feature.text.replace(/(size: \d+)/i, `Size: ${count}`);

      await miro.board.widgets.update(feature);
    }),
  );

  await updateStatus("ok");
};

export const handleValidate = async () => {
  if (!window.frame) {
    return;
  }

  const { stickers, iterations, features } = await getBoardData();

  const iterationStats = {};
  console.debug("iterations", iterations);
  // count iteration loads
  const isIterationsValid = iterations.every((iteration) => {
    const stickersWithin = stickers.filter(
      (item) => item !== iteration && isRoughlyWithinColumn(item, iteration),
    );

    const actualLoad = countStickersPoints(stickersWithin);

    const iterationName =
      iteration.text.match(/(?<name>I\d\.\d)/i)?.groups.name;

    console.debug("iterationName", iterationName, iteration.plainText);

    const iterationVelocity = Number(
      iteration.text.match(/vel: (?<count>\d+)/i)?.groups.count ?? 0,
    );
    const iterationLoad = Number(
      iteration.text.match(/ld: (?<count>\d+)/i)?.groups.count ?? 0,
    );

    const iterationDiff = Math.abs(iterationVelocity - iterationLoad);

    if (iterationName) {
      iterationStats[iterationName] = {
        velocity: iterationVelocity,
        load: iterationLoad,
        diff: iterationDiff,
      };
    }

    return actualLoad === iterationLoad;
  });

  // count feature sizes
  const isFeaturesValid = features.every((feature) => {
    const stickersWithin = stickers.filter(
      (item) => item !== feature && isRoughlyWithinRow(item, feature),
    );

    const count = countStickersPoints(stickersWithin);

    const featureCount = Number(
      feature.text.match(/size: (?<count>\d+)/i)?.groups.count ?? 0,
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
