/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
const { AppConstants } = ChromeUtils.import(
    "resource://gre/modules/AppConstants.jsm"
);

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
        goto(hash);
    }
}

const goto = (tab) => {
    const tabContentEl = document.getElementById(`tab-content-${tab}`);
    const tabEl = document.getElementById(`tab-${tab}`);

    document.querySelectorAll(".sidebar-category").forEach(i => i.removeAttribute("selected"))
    document.querySelectorAll(".tab-content").forEach(i => i.style.display = "none")
    if (tabEl) tabEl.setAttribute("selected", "true");
    if (tabContentEl) {
        selectedTab = tab;
        tabContentEl.style.display = "initial";
        if (tabEl) tabContentEl.querySelector(".section-title").textContent = tabEl.querySelector("span").innerText;
    }

    if (!tabContentEl) {
        selectedTab = `not-found`;
        document.getElementById(`tab-content-not-found`).style.display = "initial";
    }

    document.location.hash = tab;
}

const ready = async () => {
    console.log("[Settings] Initialising settings components.")

    updateThemeData();

    searchbox.init();
    profiles.init();
    startup.init();

    if (Services.policies.status == Services.policies.ACTIVE) {
        policies.init();
    }

    startPerioicEvents();

    window.addEventListener("hashchange", readHash)

    const initialHash = window.location.hash.split("#")[1];

    if (initialHash && initialHash == "not-found") {
        goto("general");
        searchbox._searchBoxEl.blur();
    }

    if (!initialHash) document.getElementById("sidebar").childNodes[1].childNodes[1].click();

    readHash();
    registerPrefs();
}

const startPerioicEvents = () => {
    const run = () => {
        startup.checkDefaultBrowser();
    }

    setInterval(run, 2000);
    run();
}

const editPref = (key, value, type) => {
    if (type == "bool") Services.prefs.setBoolPref(key, value);

    console.log(`[PrefStore] ${key}: ${type} => ${value}`);
}

const registerPrefs = () => {
    Array.from(document.querySelectorAll("[data-preference]:not([data-preference-registered])"))
        .forEach(pref => {
            const prefName = pref.getAttribute("data-preference");
            const prefType = pref.getAttribute("data-preference-type");

            if (!prefType)
                console.error(`Missing data-preference-type attribute on`, pref);

            pref.addEventListener("click", () => {
                pref.setAttribute("data-preference-registered", "true");

                switch (prefType) {
                    case "bool":
                        try {
                            const currentValue = Services.prefs.getBoolPref(prefName);
                            const newValue = !currentValue; // invert current value e.g. true -> false;

                            editPref(prefName, newValue, prefType);

                            if (newValue) pref.setAttribute("checked", "true");
                            else pref.removeAttribute("checked");
                        } catch (e) {
                            console.error(e);
                        }

                        break;
                    default:
                        console.error(`Unknown type "${prefType}" on`, pref);
                }
            });
        })
}

window.addEventListener("focus", updateThemeData);
window.addEventListener("blur", updateThemeData);
window.addEventListener("DOMContentLoaded", ready);
window.addEventListener("pageshow", updateThemeData, { once: true });