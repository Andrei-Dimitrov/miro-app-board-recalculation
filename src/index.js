import { libraryIcon, toolbarIcon } from "./constants.js";

miro.onReady(async () => {
  let frameId;
  const path = window.location.pathname.replace("/index.html", "");

  const init = async () => {
    await miro.board.ui.openLeftSidebar(`${path}/sidebar.html`);
    // wait for sidebar to open
    setTimeout(() => miro.broadcastData({ frameId, from: "main" }), 2000);
  }

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

  miro.addListener("DATA_BROADCASTED", (ev) => {
    if (ev.data.frameId && ev.data.from === "sidebar") {
      frameId = ev.data.frameId

      console.debug('UPDATED FRAME ID IN INDEX', ev.data.frameId);
    }
  })
});
