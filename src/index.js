import { libraryIcon, toolbarIcon } from "./constants.js";

miro.onReady(async () => {
  const path = window.location.pathname.replace("/index.html", "");

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

  miro.addListener("DATA_BROADCASTED", (ev) => {
    console.debug('ev', ev);
  })
});
