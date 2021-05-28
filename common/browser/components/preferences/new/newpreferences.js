/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

ChromeUtils.defineModuleGetter(
    this,
    "LightweightThemeManager",
    "resource://gre/modules/LightweightThemeManager.jsm"
);

const updateThemeData = () => {
    const themeData = Object.entries(LightweightThemeManager.currentThemeWithFallback);

    for (const [key, value] of themeData) {
        if (typeof value == "string") {
            document.body.style.setProperty(`--theme-${key.replace(/_/g, "-")}`, value);
        }
    }
}

const ready = () => {
    console.log("[Settings] Initialising settings components.")

    profiles.init();
}

window.addEventListener("focus", updateThemeData);
window.addEventListener("blur", updateThemeData);
window.addEventListener("DOMContentLoaded", ready);
window.addEventListener("pageshow", updateThemeData, { once: true });