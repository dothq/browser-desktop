/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

ChromeUtils.defineModuleGetter(
    this,
    "LightweightThemeManager",
    "resource://gre/modules/LightweightThemeManager.jsm"
);
ChromeUtils.defineModuleGetter(
    this,
    "AddonManager",
    "resource://gre/modules/AddonManager.jsm"
);

const updateThemeData = () => {
    const themeData = Object.entries(LightweightThemeManager.currentThemeWithFallback);

    for (const [key, value] of themeData) {
        if (typeof value == "string") {
            document.body.style.setProperty(`--theme-${key.replace(/_/g, "-")}`, value);
        }
    }
}

const BUILT_IN_THEMES = [
    "dynamic@themes.dothq.co",
    "light@themes.dothq.co",
    "dark@themes.dothq.co",
];

/* Make sure the theme is light mode on startup. */
windowRoot.ownerGlobal.BrowserHome();
AddonManager.getAddonByID(BUILT_IN_THEMES[1]).then(addon => addon.enable());

window.addEventListener("DOMContentLoaded", () => {
    BUILT_IN_THEMES.forEach(theme => {
        var themeName = "";

        if (theme.startsWith("dynamic")) themeName = "auto"
        else themeName = theme.split("@")[0]

        AddonManager.getAddonByID(theme).then(addon => {
            document.querySelector(`#welcome-theme-${themeName} > .welcome-theme-name`)
                .innerText = addon.name
        })
    })

    updateThemeData();
});
window.addEventListener("pageshow", updateThemeData, { once: true });

const selectSlide = (slide) => {
    const slides = document.getElementById("welcome-slides");

    slides.style.setProperty(
        "--slide",
        slide
    )
}

const selectTheme = (id) => {
    var themeId = BUILT_IN_THEMES[id];
    var themeClass = themeId.startsWith("dynamic") ? "auto" : themeId.split("@")[0]

    Array.from(document.querySelectorAll(`.welcome-theme`)).map(i => {
        i.removeAttribute("selected")
    });
    document.getElementById(`welcome-theme-${themeClass}`).setAttribute("selected", "true");

    AddonManager.getAddonByID(themeId).then(addon => {
        addon.enable();
    });
}