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
  protocolFlags: Ci.nsIProtocolHandler.URI_DANGEROUS_TO_LOAD,

  newChannel(uri, loadInfo) {
    let realURL = NetUtil.newURI(`about:${uri.pathQueryRef.split("//")}`);
    let channel = Services.io.newChannelFromURIWithLoadInfo(realURL, loadInfo);
    loadInfo.resultPrincipalURI = realURL;
    return channel;
  },

  QueryInterface: ChromeUtils.generateQI(["nsIProtocolHandler"]),
};

var EXPORTED_SYMBOLS = ["DotProtocolHandler"];
