import { exportPublic } from "./shared/globals";

const i = (path: string): any => {
    const imported = ChromeUtils.import(path);

    for (const [key, value] of Object.entries(imported)) {
        exportPublic(key, value);
    }

    return imported;
};

export const ChromeUtils = window.ChromeUtils;
export const Components = window.Components;

export const { Services } = i(
    "resource://gre/modules/Services.jsm"
);
export const { AppConstants } = i(
    "resource://gre/modules/AppConstants.jsm"
);

export const Ci = window.Ci;
export const Cc = window.Cc;
export const Cu = window.Cu;

export const PathUtils = window.PathUtils;
export const IOUtils = window.IOUtils;

export const { LightweightThemeConsumer } = i(
    "resource://gre/modules/LightweightThemeConsumer.jsm"
);
export const { E10SUtils } = i(
    "resource://gre/modules/E10SUtils.jsm"
);
export const { ActorManagerParent } = i(
    "resource://gre/modules/ActorManagerParent.jsm"
);
export const { AddonManager } = i(
    "resource://gre/modules/AddonManager.jsm"
);

export const { BrowserWindowTracker } = i(
    "resource:///modules/BrowserWindowTracker.jsm"
);

export const { NetUtil } = i(
    "resource://gre/modules/NetUtil.jsm"
);

export const { AboutPagesUtils } = i(
    "resource://gre/modules/AboutPagesUtils.jsm"
);

export const { PrivateBrowsingUtils } = i(
    "resource://gre/modules/PrivateBrowsingUtils.jsm"
);

export const { SitePermissions } = i(
    "resource:///modules/SitePermissions.jsm"
);

export const { OS } = i(
    "resource://gre/modules/osfile.jsm"
);
export const { FileUtils } = i(
    "resource://gre/modules/FileUtils.jsm"
);

export const { SiteDataManager } = i(
    "resource:///modules/SiteDataManager.jsm"
);

export const { Sqlite } = i(
    "resource://gre/modules/Sqlite.jsm"
);

export const { AsyncShutdown } = i(
    "resource://gre/modules/AsyncShutdown.jsm"
);

export const { PageThumbs } = i(
    "resource://gre/modules/PageThumbs.jsm"
);

export const { XPCOMUtils } = i(
    "resource://gre/modules/XPCOMUtils.jsm"
);

export const ReferrerInfo = Components.Constructor(
    "@mozilla.org/referrer-info;1",
    "nsIReferrerInfo",
    "init"
);

export const { ContentCrashHandlers } = i(
    "resource:///modules/ContentCrashHandlers.jsm"
);

export const { ShortcutUtils } = i(
    "resource://gre/modules/ShortcutUtils.jsm"
);

export const { BrowserToolboxLauncher } = i(
    "resource://devtools/client/framework/browser-toolbox/Launcher.jsm"
);

export const { BrowserUIUtils } = i(
    "resource:///modules/BrowserUIUtils.jsm"
)

let _BrowserHandler: any = {};
XPCOMUtils.defineLazyServiceGetters(_BrowserHandler, {
    BrowserHandler: ["@mozilla.org/browser/clh;1", "nsIBrowserHandler"],
});
export const { BrowserHandler } = _BrowserHandler;