/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { useDistinctSystemPrincipalLoader } = ChromeUtils.import(
  "resource://devtools/shared/loader/Loader.jsm"
);

const EXPORTED_SYMBOLS = ["DevtoolsServer"];

let singletonInstance;

/**
 * Opens a devtool server that can be inspected using Firefox's devtools.
 * Construct using {@link DevtoolsServer.get}
 *
 * The port can be set either by passing it in to the function or setting the
 * appropriate preference value. If there is no port value provided, Gecko will
 * find a free port and use it instead
 *
 * To connect to the devtools server:
 * 1. Open 'about:debugging' in Firefox or Pulse Browser
 * 2. Open the setup tab
 * 3. Enter the following host inside of network locations 'localhost:${listener.port}' and click 'Add'
 * 4. Click 'Connect' in the left sidebar
 * 5. Click on the entry in the left sidebar
 * 6. Click 'Open in Browser Toolbox'
 *
 * ## Usage
 * ```js
 * const { DevtoolsServer } = ChromeUtils.import("resource://app/modules/DevtoolsServer.jsm");
 *
 * const devtools = DevtoolsServer.get();
 * devtools.start();
 *
 * const port = devtools.port;
 * devtools.logInstructions();
 *
 * devtools.start(); // Will warn and do nothing
 * ```
 */
class DevtoolsServer {
  /**
   * @param {number} [port] The port you want to open the devtools on.
   * @param {boolean} [silent] If true, instructions will not be logged to the console.
   *
   * @private
   */
  constructor(port, silent) {
    if (singletonInstance) {
      throw new Error(
        "DevtoolsServer is a singleton. Do not call the constructor directly, instead call DevtoolsServer.get"
      );
    }

    this.defaultPort = port;
    this.silent = silent || false;

    /**
     * @protected
     */
    this._loader = useDistinctSystemPrincipalLoader(this);

    singletonInstance = this;
  }

  /**
   * @param {number} [port] The port you want to open the devtools on.
   * @param {boolean} [silent] If true, instructions will not be logged to the console.
   *
   * @returns {DevtoolsServer}
   */
  static get(port, silent) {
    if (singletonInstance && (port || typeof silent !== "undefined")) {
      console.warn(
        "Devtools have already been initialized. Your new settings will not be applied"
      );
    }

    if (!singletonInstance) {
      new DevtoolsServer(port, silent);
    }

    return singletonInstance;
  }

  /**
   * Starts the devtools server.
   * @returns {DevtoolsServer}
   */
  start() {
    if (this._listener) {
      console.warn("Devtools server already started");
      return this;
    }

    const { DevToolsServer: MozillaDevtoolsServer } = this._loader.require(
      "devtools/server/devtools-server"
    );
    const { SocketListener } = this._loader.require(
      "devtools/shared/security/socket"
    );

    this.devToolsServer = MozillaDevtoolsServer;

    this.devToolsServer.init();
    // We mainly need a root actor and target actors for opening a toolbox, even
    // against chrome/content. But the "no auto hide" button uses the
    // preference actor, so also register the browser actors.
    this.devToolsServer.registerAllActors();
    this.devToolsServer.allowChromeProcess = true;

    const serverPort =
      this.defaultPort ||
      Services.prefs.getIntPref("devtools.debugger.server-port", -1);
    const socketOptions = {
      portOrPath: serverPort,
    };

    /**
     * @protected
     */
    this._listener = new SocketListener(this.devToolsServer, socketOptions);
    this._listener.open();

    if (!this.silent) {
      dump(`Devtools opened on port ${this.port}`);
      this.logInstructions();
    }

    return this;
  }

  logInstructions() {
    dump(`
    To connect to the devtools server:
    1. Open 'about:debugging' in Firefox or Pulse Browser
    2. Open the setup tab
    3. Enter the following host inside of network locations 'localhost:${this.port}' and click 'Add'
    4. Click 'Connect' in the left sidebar
    5. Click on the entry in the left sidebar
    6. Click 'Open in Browser Toolbox'
`);
  }

  /**
   * Returns the port the devtools server is listening on. This will return
   * undefined if the server has not been started
   *
   * @return {?number} The port the devtools server is listening on.
   */
  get port() {
    if (!this._listener) {
      return;
    }

    return this._listener.port;
  }
}
