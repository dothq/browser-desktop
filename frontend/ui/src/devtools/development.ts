const { DevtoolsServer } = ChromeUtils.import(
  "resource://app/modules/DevtoolsServer.jsm"
);

const devtools = DevtoolsServer.get();
devtools.start();

// Opens about:memory in new window
// Services.ww.openWindow(
//   null,
//   "about:memory",
//   "_blank",
//   [
//     "dialog",
//     "resizable",
//     "minimizable",
//     "centerscreen",
//     "titlebar",
//     "close",
//   ].join(","),
//   []
// );
