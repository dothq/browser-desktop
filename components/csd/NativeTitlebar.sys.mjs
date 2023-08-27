/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { AppConstants } = ChromeUtils.importESModule("resource://gre/modules/AppConstants.sys.mjs");

let kNativeTitlebarInitted = false;
let kNativeTitlebarEnabled = false;

export const NativeTitlebar = {
    QueryInterface: ChromeUtils.generateQI([
        "nsIObserver",
        "nsIContentPrefObserver",
        "nsISupportsWeakReference"
    ]),

    _docs: new Set(),

    /**
     * Determines whether we are using a native titlebar
     */
    get enabled() {
        return (
            kNativeTitlebarEnabled ||
            Services.prefs.getBoolPref("dot.window.use-native-titlebar", false)
        );
    },

    /**
     * @deprecated
     */
    set enabled(newVal) {
        throw new Error(
            "NativeTitlebar.enabled setter should not be used! See NativeTitlebar.set() instead."
        );
    },

    /**
     * There are some situations where we need to enforce a native titlebar
     * For instance: with popup windows.
     * @param {Document} doc
     */
    shouldEnforceTitlebar(doc) {
        // Ensure popup windows don't get the custom titlebar treatment
        if (doc.documentElement.getAttribute("chromehidden")) {
            doc.documentElement.removeAttribute("chromemargin");

            return false;
        }

        return true;
    },

    /**
     * Sets the state of the native titlebar
     * @param {boolean} enabled
     * @param {boolean} permanent - Whether the state should persist between restarts
     */
    set(enabled, permanent) {
        for (const doc of this._docs) {
            if (!doc) {
                continue;
            }

            const isAllowed = this.shouldEnforceTitlebar(doc);
            if (!isAllowed) continue;

            if (enabled) {
                doc.documentElement.removeAttribute("chromemargin");
            } else {
                doc.documentElement.setAttribute(
                    "chromemargin",
                    AppConstants.platform == "macosx" ? "0,-1,-1,-1" : "0,2,2,2"
                );
            }
        }

        kNativeTitlebarEnabled = enabled;

        if (permanent) {
            Services.prefs.setBoolPref("dot.window.use-native-titlebar", enabled);
        }
    },

    /**
     * Observes preference changes
     * @param {any} subject
     * @param {any} topic
     * @param {any} data
     */
    observe(subject, topic, data) {
        switch (data) {
            case "dot.window.use-native-titlebar":
                const val = Services.prefs.getBoolPref("dot.window.use-native-titlebar");

                // Make sure the change is permanent
                this.set(val, true);
                break;
        }
    },

    /**
     * Initialises the NativeTitlebar module
     * @param {Document} doc
     */
    init(doc) {
        if (this._docs.has(doc)) return;
        this._docs.add(doc);

        const initValue = Services.prefs.getBoolPref("dot.window.use-native-titlebar", true);
        this.set(initValue, true);

        doc.addEventListener("DOMContentLoaded", () => this.shouldEnforceTitlebar(doc), {
            once: true
        });

        if (!kNativeTitlebarInitted) {
            kNativeTitlebarInitted = true;
            Services.prefs.addObserver("dot.window.", this);
        }
    }
};
