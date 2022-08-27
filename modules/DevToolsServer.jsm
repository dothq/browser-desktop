/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { useDistinctSystemPrincipalLoader } = ChromeUtils.import(
  "resource://devtools/shared/loader/Loader.jsm"
);

const EXPORTED_SYMBOLS = ["DevToolsServer"];

let singletonInstance;

/**
 * Opens a DevTools server that can be inspected using Firefox's DevTools.
 * Construct using {@link DevToolsServer.get}
 *
 * The port can be set either by passing it in to the function or setting the
 * appropriate preference value. If there is no port value provided, Gecko will
 * find a free port and use it instead
 *
 * ## Usage
 * ```js
 * const { DevToolsServer } = ChromeUtils.import("resource://app/modules/DevToolsServer.jsm");
 *
 * const devtools = DevToolsServer.get();
 * devtools.start();
 *
 * const port = devtools.port;
 *
 * devtools.start(); // Will warn and do nothing
 * ```
 */
class DevToolsServer {
  /**
   * @param {number} [port] The port you want to open the DevTools on.
   *
   * @private
   */
  constructor(port) {
    if (singletonInstance) {
      throw new Error(
        "DevToolsServer is a singleton. Do not call the constructor directly, instead call DevToolsServer.get"
      );
    }

    this.defaultPort = port;

    /**
     * @protected
     */
    this._loader = useDistinctSystemPrincipalLoader(this);

    singletonInstance = this;
  }

  /**
   * @param {number} [port] The port you want to open the DevTools on.
   *
   * @returns {DevToolsServer}
   */
  static get(port) {
    if (singletonInstance && port) {
        console.warn(
            "DevTools have already been initialised. New settings will not be applied"
        );
    }

    if (!singletonInstance) {
        new DevToolsServer(port);
    }

    return singletonInstance;
  }

  /**
   * Starts the DevTools server.
   * @returns {DevToolsServer}
   */
  start() {
    if (this._listener) {
      console.warn("Devtools server already started");
      return this;
    }

    const { DevToolsServer: MozillaDevToolsServer } = this._loader.require(
      "devtools/server/devtools-server"
    );
    const { SocketListener } = this._loader.require(
      "devtools/shared/security/socket"
    );

    this.DevToolsServer = MozillaDevToolsServer;

    this.DevToolsServer.init();
    // We mainly need a root actor and target actors for opening a toolbox, even
    // against chrome/content. But the "no auto hide" button uses the
    // preference actor, so also register the browser actors.
    this.DevToolsServer.registerAllActors();
    this.DevToolsServer.allowChromeProcess = true;

    const serverPort =
        this.defaultPort ||
        Services.prefs.getIntPref("devtools.debugger.server-port", -1);
    const socketOptions = {
        portOrPath: serverPort,
    };

    /**
     * @protected
     */
    this._listener = new SocketListener(this.DevToolsServer, socketOptions);
    this._listener.open();

    dump(`DevTools server started on port ${this.port}.`);

    return this;
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
