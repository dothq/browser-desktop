class DevtoolsRecovery {
    onKeyDown(e) {
        if (
            e.ctrlKey &&
            e.shiftKey &&
            e.altKey &&
            e.which == 122
        ) {
            let canOpen = Services.prefs.getBoolPref(
                "devtools.chrome.enabled"
            );

            // Override this as we are unable to load the browser
            if (!"dot" in window) {
                canOpen = true;
            }

            if (canOpen) {
                const launcher = ChromeUtils.import(
                    "resource://devtools/client/framework/browser-toolbox/Launcher.jsm"
                ).BrowserToolboxLauncher;

                launcher.init();
            }
        }
    }

    constructor() {
        window.addEventListener(
            "keydown",
            this.onKeyDown
        );
    }
}

new DevtoolsRecovery();
