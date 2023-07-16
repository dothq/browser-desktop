/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { AddonManager } = ChromeUtils.importESModule(
    "resource://gre/modules/AddonManager.sys.mjs"
);

var { AppConstants } = ChromeUtils.importESModule(
    "resource://gre/modules/AppConstants.sys.mjs"
);

var { DotAppConstants } = ChromeUtils.importESModule(
    "resource://gre/modules/DotAppConstants.sys.mjs"
);

/**
 * Utility function to convert bytes to a human-readable format
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'kB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Utility function to work out percentage difference between a value and its maximum
 * @param {number} val 
 * @param number max 
 * @returns 
 */
function perDiff(val, max) {
    return ((1.0 - (max - val) / max) * 100).toFixed(2);
}

class DeveloperDebugPanel extends MozHTMLElement {
    constructor() {
        super();
    }

    elements = {
        app_info: html("span"),
        proc_info: html("span"),
        active_theme: html("span"),
        user_agent: html("span"),
    }

    resourceUsageInt = null;

    onAddonEnabled(addon) {
        if (addon.type != "theme") return;

        this.elements.active_theme.textContent = `active_theme_id = ${addon.id}`;
    }

    async calculateResourceUsage() {
        const procInfo = await ChromeUtils.requestProcInfo();

        let data = [
            `PID: ${procInfo.pid}`,
            `Memory: ${formatBytes(procInfo.memory)}`,
            `Processes: ${procInfo.children.length}`,
            `Threads: ${procInfo.threads.length}`,
        ];

        if (procInfo.children.length) {
            data.push("");

            for (const child of procInfo.children) {
                data.push(`${child.type} (id=${child.childID} pid=${child.pid})`);
                data.push(`    Memory: ${formatBytes(child.memory)} (${perDiff(child.memory, procInfo.memory)}%)`);
                data.push(`    Threads: ${child.threads.length}`);
                data.push(`    Windows: ${child.windows.length}`);
            }
        }

        this.elements.proc_info.textContent = data.join("\n");
    }

    async init() {
        const activeTheme = (await AddonManager.getAddonsByTypes(["theme"]))
            .find(ext => ext.isActive);

        AddonManager.addAddonListener({
            onEnabled: this.onAddonEnabled.bind(this)
        });

        this.resourceUsageInt = setInterval(() => {
            if (document.visibilityState == "hidden") {
                this.elements.proc_info.textContent = "proc_info paused";
                return;
            }

            this.calculateResourceUsage();
        }, 1000);

        this.onAddonEnabled(activeTheme);
        this.calculateResourceUsage();

        const dotVersion = document.createElement("strong");
        dotVersion.textContent = `Dot Browser v${DotAppConstants.DOT_APP_VERSION} (${AppConstants.MOZ_BUILDID})`;

        this.elements.app_info.append(
            dotVersion,
            document.createElement("br"),
            `Firefox v${AppConstants.MOZ_APP_VERSION}`
        )

        this.elements.user_agent.textContent = `user_agent = ${Cc["@mozilla.org/network/protocol;1?name=http"].getService(
            Ci.nsIHttpProtocolHandler
        ).userAgent}`;
    }

    insertStylesheet() {
        const sheet = document.createProcessingInstruction(
            "xml-stylesheet",
            `href="chrome://dot/content/widgets/dev-debug-panel.css" type="text/css"`
        );

        document.insertBefore(
            sheet,
            document.documentElement
        );
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;
        this.classList.add("dev-panel");

        this.appendChild(this.elements.app_info);
        this.appendChild(this.elements.proc_info);
        this.appendChild(this.elements.active_theme);
        this.appendChild(this.elements.user_agent);

        this.init();

        this.insertStylesheet();
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;

        clearInterval(this.resourceUsageInt);
    }
}

customElements.define("dev-debug-panel", DeveloperDebugPanel);