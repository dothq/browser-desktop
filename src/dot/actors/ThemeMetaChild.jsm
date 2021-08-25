/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const EXPORTED_SYMBOLS = ["ThemeMetaChild"];

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

class ThemeMetaChild extends JSWindowActorChild {
  onMetaEvent(event) {
    const meta = event.target;

    if (!meta || !meta.ownerDocument || meta.ownerGlobal != this.contentWindow) {
      return;
    }

    const metaName = meta.getAttribute("name");
    const metaContent = meta.getAttribute("content");
    const metaMedia = meta.getAttribute("media");

    if (metaName && metaContent) {
      if (metaName == "theme-color") {
        const isValidColor = CSS.supports("color", metaContent);
        const matchesMedia = metaMedia
          ? meta.ownerGlobal.matchMedia(metaMedia).matches
          : true;

        if (isValidColor && matchesMedia) {
          this.sendAsyncMessage("Theme:ColorCollected", {
            color: metaContent
          });
        }
      }
    }
  }

  handleEvent(event) {
    switch (event.type) {
      case "DOMMetaAdded":
      case "DOMMetaChanged":
      case "DOMMetaRemoved":
        return this.onMetaEvent(event);
    }
  }
}
