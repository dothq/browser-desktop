/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { AppConstants } = ChromeUtils.importESModule(
    "resource://gre/modules/AppConstants.sys.mjs"
);

export const NativeTitlebar = {
    QueryInterface: ChromeUtils.generateQI([
        "nsIObserver",
        "nsIContentPrefObserver",
        "nsISupportsWeakReference",
    ]),

    _doc: null,

    _enabled: Services.prefs.getBoolPref(
        "dot.window.use-native-titlebar",
        false
    ),

    /**
     * Determines whether we are using a native titlebar
     */
    get enabled() {
        return this._enabled;
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
     * Sets the state of the native titlebar
     * @param {boolean} enabled 
     * @param {boolean} permanent - Whether the state should persist between restarts
     */
    set(enabled, permanent) {
        if (enabled) {
            this._doc.documentElement.removeAttribute("chromemargin");
        } else {
            this._doc.documentElement.setAttribute(
                "chromemargin",
                AppConstants.platform == "macosx"
                    ? "0,-1,-1,-1"
                    : "0,2,2,2"
            );
        }

        this._enabled = enabled;

        if (permanent) {
            Services.prefs.setBoolPref(
                "dot.window.use-native-titlebar",
                enabled
            );
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
                const val = Services.prefs.getBoolPref(
                    "dot.window.use-native-titlebar"
                );

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
        this._doc = doc;

        this.set(this.enabled, false);

        Services.prefs.addObserver("dot.window.", this);
    }
}