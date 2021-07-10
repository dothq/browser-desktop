/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChromeUtils } from "../modules";

class BrowserToolbox {
    _launcher: any = null;

    constructor() {
        this._launcher = ChromeUtils.import(
            "resource://devtools/client/framework/browser-toolbox/Launcher.jsm"
        ).BrowserToolboxLauncher
    }

    launch() {
        this._launcher.init();
    }
}

export const dotToolbox = new BrowserToolbox();