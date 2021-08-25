"use static";

window.Services = ChromeUtils.import("resource://gre/modules/Services.jsm").Services;
window.XPCOMUtils = ChromeUtils.import(
    "resource://gre/modules/XPCOMUtils.jsm"
).XPCOMUtils;

(async () => {
    let oldThemeData;

    addEventListener("theme-update", (event) => {
        const themeData = event.detail.data;

        if (oldThemeData) {
            // remove old theme keys
            for (const [key] of Object.entries(themeData)) {
                document.documentElement.style.removeProperty(key);
            }
        } else {
            oldThemeData = themeData;
        }

        for (const [key, value] of Object.entries(themeData)) {
            document.documentElement.style.setProperty(
                key,
                value
            )
        }
    })
})();