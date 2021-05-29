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

let selectedTab;

const readHash = () => {
    if (selectedTab) {
        const oldTabContentEl = document.getElementById(`tab-content-${selectedTab}`);

        if (oldTabContentEl) oldTabContentEl.style.display = "none";
    }

    const hash = window.location.hash.split("#")[1];

    if (hash.length !== 0) {
        const tabContentEl = document.getElementById(`tab-content-${hash}`);
        const tabEl = document.getElementById(`tab-${hash}`);

        document.querySelectorAll(".sidebar-category").forEach(i => i.removeAttribute("selected"))
        if (tabEl) tabEl.setAttribute("selected", "true");
        if (tabContentEl) {
            selectedTab = hash;
            tabContentEl.style.display = "initial";
        }

        if (!tabContentEl) {
            selectedTab = `not-found`;
            document.getElementById(`tab-content-not-found`).style.display = "initial";
        }

        tabContentEl.querySelector(".section-title").textContent = tabEl.querySelector("span").innerText;
    }
}

const ready = async () => {
    console.log("[Settings] Initialising settings components.")

    profiles.init();

    window.addEventListener("hashchange", readHash)

    const initialHash = window.location.hash.split("#")[1];
    if (!initialHash) document.getElementById("sidebar").childNodes[1].childNodes[1].click();

    readHash();
}

window.addEventListener("focus", updateThemeData);
window.addEventListener("blur", updateThemeData);
window.addEventListener("DOMContentLoaded", ready);
window.addEventListener("pageshow", updateThemeData, { once: true });