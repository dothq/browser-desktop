/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const ChromeUtils = {
    import: () => { },
    defineModuleGetter: () => { },
};

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
const { AppConstants } = ChromeUtils.import(
    "resource://gre/modules/AppConstants.jsm"
);
const { MigrationUtils } = ChromeUtils.import(
    "resource:///modules/MigrationUtils.jsm"
);

const SELECTED_CLASS = "sidebar-category-selected";

window.addEventListener("DOMContentLoaded", () => {
    const hash = window.location.hash.split("#")[1];

    if (hash) {
        let tab;

        try {
            tab = document.getElementById(`tab-${hash}`);

            document.getElementById("tab-all").classList.remove(SELECTED_CLASS);
            tab.classList.add(SELECTED_CLASS);
        } catch (e) {
            return window.location.replace("about:history");
        }
    } else {
        document.getElementById("tab-all").classList.add(SELECTED_CLASS);
    }
})

window.addEventListener("hashchange", (e) => {
    let oldHash = e.oldURL.split("#")[1];
    let newHash = e.newURL.split("#")[1];

    if (typeof (oldHash) == "undefined") oldHash = "all";

    let oldTab;
    let newTab;

    try {
        oldTab = document.getElementById(`tab-${oldHash}`);
        newTab = document.getElementById(`tab-${newHash}`);

        oldTab.classList.remove(SELECTED_CLASS);
        newTab.classList.add(SELECTED_CLASS);
    } catch (e) {
        return window.location.replace("about:home");
    }
}) 