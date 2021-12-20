import toolbarIcon from "/static/toolbarIcon.svg?url";
import libraryIcon from "/static/libraryIcon.svg?url";

miro.onReady(async () => {
  let frameId: string;
  const path = window.location.pathname.replace("/index.html", "");

  const init = async () => {
    const isAuthorized = await miro.isAuthorized();

    if (!isAuthorized) {
      // Ask the user to authorize the app.
      await miro.requestAuthorization();
    }

    // let the sidebar now what frame was previously selected
    const queryParams = frameId ? `?frameId=${frameId}` : "";

    // # is required to support the hash router
    await miro.board.ui.openLeftSidebar(`${path}/sidebar.html#/${queryParams}`);
  };

  await miro.initialize({
    extensionPoints: {
      toolbar: {
        title: "Recalculate the PIP board",
        toolbarSvgIcon: toolbarIcon,
        librarySvgIcon: libraryIcon,
        async onClick() {
          await init();
        },
      },
      bottomBar: {
        title: "Recalculate the PIP board",
        svgIcon: toolbarIcon,
        async onClick() {
          await init();
        },
      },
    },
  });

  miro.addListener("DATA_BROADCASTED", (ev) => {
    if (ev.data.frameId && ev.data.from === "sidebar") {
      frameId = ev.data.frameId;
    }
  });
});

export {};
