/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { XPCOMUtils } = ChromeUtils.import(
  "resource://gre/modules/XPCOMUtils.jsm"
);
const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
const { NetUtil } = ChromeUtils.import("resource://gre/modules/NetUtil.jsm");

function DotProtocolHandler() {

}

DotProtocolHandler.prototype = {
  scheme: "dot",
  defaultPort: -1,
  protocolFlags:
    Ci.nsIProtocolHandler.URI_STD |
    Ci.nsIProtocolHandler.URI_IS_UI_RESOURCE |
    Ci.nsIProtocolHandler.URI_IS_LOCAL_RESOURCE,

  newChannel(uri, loadInfo) {
    let realURL;
    let channel;

    try {
      realURL = NetUtil.newURI(`about:${uri.pathQueryRef.split("//")[1]}`);

      channel = Services.io.newChannelFromURIWithLoadInfo(realURL, loadInfo);
      loadInfo.resultPrincipalURI = realURL;
      return channel;
    } catch (err) {
      let aboutBlank = NetUtil.newURI(`about:blank`);

      return Services.io.newChannelFromURIWithLoadInfo(aboutBlank, {});
    }
  },

  QueryInterface: ChromeUtils.generateQI(["nsIProtocolHandler"]),
};

var EXPORTED_SYMBOLS = ["DotProtocolHandler"];
