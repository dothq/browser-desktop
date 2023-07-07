/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppConstants } from "resource://gre/modules/AppConstants.sys.mjs";
import { XPCOMUtils } from "resource://gre/modules/XPCOMUtils.sys.mjs";

var lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
    ActorManagerParent: "resource://gre/modules/ActorManagerParent.sys.mjs",
    BuiltInThemes: "resource:///modules/BuiltInThemes.sys.mjs",
    ContextualIdentityService: "resource://gre/modules/ContextualIdentityService.sys.mjs",
    SessionStartup: "resource:///modules/sessionstore/SessionStartup.sys.mjs", // @todo: shim this
    SessionStore: "resource:///modules/sessionstore/SessionStore.sys.mjs" // @todo: shim this
});

XPCOMUtils.defineLazyModuleGetters(lazy, {
    AddonManager: "resource://gre/modules/AddonManager.jsm",
    BrowserWindowTracker: "resource:///modules/BrowserWindowTracker.jsm", // @todo: shim this
    Blocklist: "resource://gre/modules/Blocklist.jsm",
    ExtensionsUI: "resource:///modules/ExtensionsUI.jsm",
    FeatureGate: "resource://featuregates/FeatureGate.jsm",
    PdfJs: "resource://pdf.js/PdfJs.jsm",
    RFPHelper: "resource://gre/modules/RFPHelper.jsm",
    SafeBrowsing: "resource://gre/modules/SafeBrowsing.jsm", // @todo: shim this
    TabUnloader: "resource:///modules/TabUnloader.jsm" // @todo: shim this
});

if (AppConstants.MOZ_CRASHREPORTER) {
    XPCOMUtils.defineLazyModuleGetters(lazy, {
        UnsubmittedCrashHandler: "resource:///modules/ContentCrashHandlers.jsm"
    });
}

XPCOMUtils.defineLazyServiceGetters(lazy, {
    PushService: ["@mozilla.org/push/Service;1", "nsIPushService"]
});

const PREF_PDFJS_ISDEFAULT_CACHE_STATE = "pdfjs.enabledCache.state";

const JSPROCESSACTORS = {};
const JSWINDOWACTORS = {
    AboutReader: {
        parent: {
            esModuleURI: "resource:///actors/AboutReaderParent.sys.mjs"
        },
        child: {
            esModuleURI: "resource:///actors/AboutReaderChild.sys.mjs",
            events: {
                DOMContentLoaded: {},
                pageshow: { mozSystemGroup: true },
                // Don't try to create the actor if only the pagehide event fires.
                // This can happen with the initial about:blank documents.
                pagehide: { mozSystemGroup: true, createActor: false }
            }
        },
        messageManagerGroups: ["browsers"]
    },

    BrowserTab: {
        parent: {
            esModuleURI: "resource:///actors/BrowserTabParent.sys.mjs"
        },
        child: {
            esModuleURI: "resource:///actors/BrowserTabChild.sys.mjs",

            events: {
                DOMDocElementInserted: {},
                MozAfterPaint: {}
            }
        },

        messageManagerGroups: ["browsers"]
    },

    ClickHandler: {
        parent: {
            esModuleURI: "resource:///actors/ClickHandlerParent.sys.mjs"
        },
        child: {
            esModuleURI: "resource:///actors/ClickHandlerChild.sys.mjs",
            events: {
                chromelinkclick: { capture: true, mozSystemGroup: true }
            }
        },

        allFrames: true
    },

    ContextMenu: {
        parent: {
            esModuleURI: "resource:///actors/DotContextMenuParent.sys.mjs"
        },
        child: {
            esModuleURI: "resource:///actors/ContextMenuChild.sys.mjs",
            events: {
                contextmenu: { mozSystemGroup: true }
            }
        },
        allFrames: true
    },

    DotPopupHandler: {
        parent: {
            esModuleURI: "resource:///actors/DotPopupHandlerParent.sys.mjs"
        },
        includeChrome: true,
        allFrames: true
    },

    LightweightTheme: {
        child: {
            esModuleURI: "resource:///actors/LightweightThemeChild.sys.mjs",
            events: {
                pageshow: { mozSystemGroup: true },
                DOMContentLoaded: {}
            }
        },
        includeChrome: true,
        allFrames: true,
        matches: [
            "about:home",
            "about:newtab",
            "about:welcome",
            "chrome://browser/content/syncedtabs/sidebar.xhtml",
            "chrome://browser/content/places/historySidebar.xhtml",
            "chrome://browser/content/places/bookmarksSidebar.xhtml",
            "about:firefoxview"
        ]
    },

    LinkHandler: {
        parent: {
            esModuleURI: "resource:///actors/DotLinkHandlerParent.sys.mjs"
        },
        child: {
            esModuleURI: "resource:///actors/LinkHandlerChild.sys.mjs",
            events: {
                DOMHeadElementParsed: {},
                DOMLinkAdded: {},
                DOMLinkChanged: {},
                pageshow: {},
                // The `pagehide` event is only used to clean up state which will not be
                // present if the actor hasn't been created.
                pagehide: { createActor: false }
            }
        },

        messageManagerGroups: ["browser"]
    },

    PageInfo: {
        child: {
            esModuleURI: "resource:///actors/PageInfoChild.sys.mjs"
        },

        allFrames: true
    },

    Pdfjs: {
        parent: {
            esModuleURI: "resource://pdf.js/PdfjsParent.sys.mjs"
        },
        child: {
            esModuleURI: "resource://pdf.js/PdfjsChild.sys.mjs"
        },
        allFrames: true
    },

    Prompt: {
        parent: {
            esModuleURI: "resource:///actors/PromptParent.sys.mjs"
        },
        includeChrome: true,
        allFrames: true
    }
};

export class DotGlue {
    QueryInterface = ChromeUtils.generateQI([
        "nsIObserver",
        "nsISupportsWeakReference",
        "nsIEnterprisePolicies"
    ]);

    isNewProfile = undefined;

    distributionCustomizer = null;

    _init() {
        [
            "notifications-open-settings",
            "final-ui-startup",
            "browser-delayed-startup-finished",
            "sessionstore-windows-restored",
            "browser:purge-session-history",
            "quit-application-requested",
            "quit-application-granted",
            "fxaccounts:onverified",
            "fxaccounts:device_connected",
            "fxaccounts:verify_login",
            "fxaccounts:device_disconnected",
            "fxaccounts:commands:open-uri",
            "session-save",
            "places-init-complete",
            "distribution-customization-complete",
            "handle-xul-text-link",
            "profile-before-change",
            "keyword-search",
            "browser-search-engine-modified",
            "restart-in-safe-mode",
            "xpi-signature-changed",
            "sync-ui-state:update",
            "handlersvc-store-initialized"
        ].forEach((topic) => Services.obs.addObserver(this, topic, true));

        this.maybeRemoveFFActors();

        lazy.ActorManagerParent.addJSProcessActors(JSPROCESSACTORS);
        lazy.ActorManagerParent.addJSWindowActors(JSWINDOWACTORS);

        this.firstWindowReadyPromise = new Promise((resolve) => (this.firstWindowLoaded = resolve));
    }

    maybeRemoveFFActors() {
        for (const key of Object.keys(JSPROCESSACTORS)) {
            ChromeUtils.unregisterProcessActor(key);
        }

        for (const key of Object.keys(JSWINDOWACTORS)) {
            ChromeUtils.unregisterWindowActor(key);
        }
    }

    async beforeUIStartup() {
        // Initialise SessionStartup
        lazy.SessionStartup.init();

        // Check if we're in safe mode and open the safe mode prompt
        if (Services.appinfo.inSafeMode) {
            Services.ww.openWindow(
                null,
                "chrome://dot/content/safeMode.xhtml",
                "_blank",
                "chrome,centerscreen,modal,resizable=no",
                null
            );
        }

        // Apply distribution customisations
        this.distributionCustomizer.applyCustomizations();

        // Apply UI migrations
        this.migrateUI();

        // Initialise SessionStore
        lazy.SessionStore.init();

        // Load our built-in themes
        lazy.BuiltInThemes.maybeInstallActiveBuiltInTheme();
    }

    maybeDisableUnsignedAddons() {
        let signingRequired;
        if (AppConstants.MOZ_REQUIRE_SIGNING) {
            signingRequired = true;
        } else {
            signingRequired = Services.prefs.getBoolPref("xpinstall.signatures.required");
        }

        if (signingRequired) {
            let disabledAddons = lazy.AddonManager.getStartupChanges(
                lazy.AddonManager.STARTUP_CHANGE_DISABLED
            );
            lazy.AddonManager.getAddonsByIDs(disabledAddons).then((addons) => {
                for (let addon of addons) {
                    if (addon.signedState <= lazy.AddonManager.SIGNEDSTATE_MISSING) {
                        // @todo: we could probably notify the user that the addons have been disabled
                        addon.disable();

                        break;
                    }
                }
            });
        }
    }

    onWindowsRestored() {
        if (this._windowsWereRestored) return;
        this._windowsWereRestored = true;

        // @todo: see if this is needed/what this does in ff
        // lazy.Interactions.init();
        // lazy.PageDataService.init();
        lazy.ExtensionsUI.init();

        // Disable any unsigned addons if MOZ_REQUIRE_SIGNING is set
        this.maybeDisableUnsignedAddons();

        if (AppConstants.MOZ_CRASHREPORTER) {
            lazy.UnsubmittedCrashHandler.init();
            lazy.UnsubmittedCrashHandler.scheduleCheckForUnsubmittedCrashReports();
            lazy.FeatureGate.annotateCrashReporter();
            lazy.FeatureGate.observePrefChangesForCrashReportAnnotation();
        }

        if (AppConstants.ASAN_REPORTER) {
            var { AsanReporter } = ChromeUtils.importESModule(
                "resource://gre/modules/AsanReporter.sys.mjs"
            );
            AsanReporter.init();
        }

        this.scheduleStartupIdleTasks();
    }

    scheduleStartupIdleTasks() {
        const idleTasks = [
            {
                name: "ContextualIdentityService.load",
                task: async () => {
                    await lazy.ContextualIdentityService.load();
                }
            },

            // Begin listening for incoming push messages.
            {
                name: "PushService.ensureReady",
                task: () => {
                    try {
                        lazy.PushService.wrappedJSObject.ensureReady();
                    } catch (ex) {
                        // NS_ERROR_NOT_AVAILABLE will get thrown for the PushService
                        // getter if the PushService is disabled.
                        if (ex.result != Cr.NS_ERROR_NOT_AVAILABLE) {
                            throw ex;
                        }
                    }
                }
            },

            // Load the Login Manager data from disk off the main thread, some time
            // after startup.  If the data is required before this runs, for example
            // because a restored page contains a password field, it will be loaded on
            // the main thread, and this initialization request will be ignored.
            {
                name: "Services.logins",
                task: () => {
                    try {
                        Services.logins;
                    } catch (ex) {
                        console.error(ex);
                    }
                },
                timeout: 3000
            },

            // Install built-in themes. We already installed the active built-in
            // theme, if any, before UI startup.
            {
                name: "BuiltInThemes.ensureBuiltInThemes",
                task: async () => {
                    await lazy.BuiltInThemes.ensureBuiltInThemes();
                }
            },

            {
                name: "DotGlue.maybeShowDefaultBrowserPrompt",
                task: () => {
                    let win = lazy.BrowserWindowTracker.getTopWindow();

                    console.log("Dot Browser is not your default web browser. todo: implement");
                }
            },

            {
                name: "handlerService.asyncInit",
                task: () => {
                    let handlerService = Cc["@mozilla.org/uriloader/handler-service;1"].getService(
                        Ci.nsIHandlerService
                    );
                    handlerService.asyncInit();
                }
            },

            // Resist fingerprinting
            {
                name: "RFPHelper.init",
                task: () => {
                    lazy.RFPHelper.init();
                }
            },

            {
                name: "Blocklist.loadBlocklistAsync",
                task: () => {
                    lazy.Blocklist.loadBlocklistAsync();
                }
            },

            {
                name: "TabUnloader.init",
                task: () => {
                    lazy.TabUnloader.init();
                }
            },

            {
                name: "unblock-untrusted-modules-thread",
                condition: AppConstants.platform == "win",
                task: () => {
                    Services.obs.notifyObservers(null, "unblock-untrusted-modules-thread");
                }
            },

            {
                name: "browser-startup-idle-tasks-finished",
                task: () => {
                    // Use idleDispatch a second time to run this after the per-window
                    // idle tasks.
                    ChromeUtils.idleDispatch(() => {
                        Services.obs.notifyObservers(null, "browser-startup-idle-tasks-finished");
                    });
                }
            }
            // Do NOT add anything after idle tasks finished.
        ];

        for (let task of idleTasks) {
            if ("condition" in task && !task.condition) {
                continue;
            }

            ChromeUtils.idleDispatch(
                () => {
                    if (!Services.startup.shuttingDown) {
                        let startTime = Cu.now();
                        try {
                            task.task();
                        } catch (ex) {
                            console.error(ex);
                        } finally {
                            ChromeUtils.addProfilerMarker("startupIdleTask", startTime, task.name);
                        }
                    }
                },
                task.timeout ? { timeout: task.timeout } : undefined
            );
        }
    }

    onFirstWindowLoaded(win) {
        this.firstWindowLoaded();
    }

    handleLink(subject, data) {
        const handledLink = subject.QueryInterface(Ci.nsISupportsPRBool);

        if (handledLink.data) return;

        console.log(data);
    }

    initPdfJs() {
        lazy.PdfJs.init();
    }

    migrateUI() { }

    // This is needed to work with nsIObserverService
    observe = async function DG_observe(subject, topic, data) {
        switch (topic) {
            case "final-ui-startup":
                this.beforeUIStartup();
                break;
            case "handle-xul-text-link":
                this.handleLink(subject, data);
                break;
            case "handlersvc-store-initialized":
                this.initPdfJs();
                break;
            case "browser-delayed-startup-finished":
                console.log("browser-delayed-startup-finished")
                this.onFirstWindowLoaded(subject);
                Services.obs.removeObserver(this, "browser-delayed-startup-finished");
                break;
            case "sessionstore-windows-restored":
                this.onWindowsRestored();
                break;
        }
    };

    constructor() {
        XPCOMUtils.defineLazyServiceGetter(
            this,
            "userIdleService",
            "@mozilla.org/widget/useridleservice;1",
            "nsIUserIdleService"
        );

        XPCOMUtils.defineLazyGetter(this, "distributionCustomizer", function () {
            const { DistributionCustomizer } = ChromeUtils.import(
                "resource:///modules/distribution.js"
            );
            return new DistributionCustomizer();
        });

        this._init();
    }
}
