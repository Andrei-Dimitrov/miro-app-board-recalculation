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

export const createBoardStats = async () => {
  const { iterations } = await getBoardData();

  const boardStats = document.getElementById("board-stats");

  if (!window.frame) {
    return;
  }

  if (boardStats.classList.contains("hidden")) {
    boardStats.classList.remove("hidden");
  }

  const iterationTable = document.getElementById("iteration-table");

  iterationTable.innerHTML = "";

  iterations.forEach((iteration) => {
    const iterationName =
      iteration.text.match(/(?<name>I\d\.\d)/i)?.groups.name;

    if (!iterationName) {
      return;
    }

    const iterationVelocity = Number(
      iteration.text.match(/vel: (?<count>\d+)/i)?.groups.count ?? 0,
    );
    const iterationLoad = Number(
      iteration.text.match(/ld: (?<count>\d+)/i)?.groups.count ?? 0,
    );
    const iterationDiff = Math.abs(iterationVelocity - iterationLoad);

    const row = document.createElement("tr");

    const name = document.createElement("td");
    name.textContent = iterationName;

    const velocity = document.createElement("td");
    velocity.textContent = iterationVelocity.toString();

    const load = document.createElement("td");
    load.textContent = iterationLoad.toString();

    const diff = document.createElement("td");
    diff.textContent = iterationDiff.toString();

    if (iterationLoad > iterationVelocity) {
      row.style.color = "#f00";
    }

    row.appendChild(name);
    row.appendChild(velocity);
    row.appendChild(load);
    row.appendChild(diff);

    iterationTable.appendChild(row);
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
  await createBoardStats();
};

export const handleValidate = async () => {
  if (!window.frame) {
    return;
  }

  const { stickers, iterations, features } = await getBoardData();

  // count iteration loads
  const isIterationsValid = iterations.every((iteration) => {
    const stickersWithin = stickers.filter(
      (item) => item !== iteration && isRoughlyWithinColumn(item, iteration),
    );

    const count = countStickersPoints(stickersWithin);

    const iterationCount = Number(
      iteration.text.match(/ld: (?<count>\d+)/i)?.groups.count ?? 0,
    );

    return count === iterationCount;
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
};
