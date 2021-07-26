/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { XPCOMUtils } = ChromeUtils.import(
    "resource://gre/modules/XPCOMUtils.jsm"
);

var EXPORTED_SYMBOLS = ["BuiltInThemes", "getBuiltInThemes"];

var themes;

class BuiltInThemes {
    DEFAULT_THEME_ID = "dynamic@themes.dothq.co"

    LIGHT_THEME_ID = "light@themes.dothq.co"
    DARK_THEME_ID = "dark@themes.dothq.co"
    FUSION_THEME_ID = "fusion@themes.dothq.co"

    constructor() {

    }
}

XPCOMUtils.defineLazyGetter(BuiltInThemes, "Singleton", function () {
    if (themes) {
        return themes;
    }

    themes = new BuiltInThemes();

    return themes;
});

function getBuiltInThemes() {
    return BuiltInThemes.Singleton;
}
