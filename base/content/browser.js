const { DevToolsServer } = ChromeUtils.import("resource://app/modules/DevToolsServer.jsm");

const devtools = DevToolsServer.get();
devtools.start();