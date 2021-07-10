export const windowActors = {
  AboutLogins: {
    parent: {
      moduleURI: "resource:///actors/AboutLoginsParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/AboutLoginsChild.jsm",
      events: {
        AboutLoginsCopyLoginDetail: { wantUntrusted: true },
        AboutLoginsCreateLogin: { wantUntrusted: true },
        AboutLoginsDeleteLogin: { wantUntrusted: true },
        AboutLoginsDismissBreachAlert: { wantUntrusted: true },
        AboutLoginsImportFromBrowser: { wantUntrusted: true },
        AboutLoginsImportFromFile: { wantUntrusted: true },
        AboutLoginsImportReportInit: { wantUntrusted: true },
        AboutLoginsImportReportReady: { wantUntrusted: true },
        AboutLoginsInit: { wantUntrusted: true },
        AboutLoginsGetHelp: { wantUntrusted: true },
        AboutLoginsOpenPreferences: { wantUntrusted: true },
        AboutLoginsOpenSite: { wantUntrusted: true },
        AboutLoginsRecordTelemetryEvent: { wantUntrusted: true },
        AboutLoginsRemoveAllLogins: { wantUntrusted: true },
        AboutLoginsSortChanged: { wantUntrusted: true },
        AboutLoginsSyncEnable: { wantUntrusted: true },
        AboutLoginsSyncOptions: { wantUntrusted: true },
        AboutLoginsUpdateLogin: { wantUntrusted: true },
        AboutLoginsExportPasswords: { wantUntrusted: true },
      },
    },
    matches: ["about:logins", "about:logins?*", "about:loginsimportreport"],
  },

  AboutNewInstall: {
    parent: {
      moduleURI: "resource:///actors/AboutNewInstallParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/AboutNewInstallChild.jsm",

      events: {
        DOMWindowCreated: { capture: true },
      },
    },

    matches: ["about:newinstall"],
  },

  AboutNewTab: {
    parent: {
      moduleURI: "resource:///actors/AboutNewTabParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/AboutNewTabChild.jsm",
      events: {
        DOMContentLoaded: {},
        pageshow: {},
        visibilitychange: {},
      },
    },
    // The wildcard on about:newtab is for the ?endpoint query parameter
    // that is used for snippets debugging. The wildcard for about:home
    // is similar, and also allows for falling back to loading the
    // about:home document dynamically if an attempt is made to load
    // about:home?jscache from the AboutHomeStartupCache as a top-level
    // load.
    matches: ["about:home*", "about:welcome", "about:newtab*"],
    remoteTypes: ["privilegedabout"],
  },

  AboutPlugins: {
    parent: {
      moduleURI: "resource:///actors/AboutPluginsParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/AboutPluginsChild.jsm",

      events: {
        DOMWindowCreated: { capture: true },
      },
    },

    matches: ["about:plugins"],
  },

  AboutPocket: {
    parent: {
      moduleURI: "resource:///actors/AboutPocketParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/AboutPocketChild.jsm",

      events: {
        DOMWindowCreated: { capture: true },
      },
    },

    matches: [
      "about:pocket-saved*",
      "about:pocket-signup*",
      "about:pocket-home*",
    ],
  },

  AboutPrivateBrowsing: {
    parent: {
      moduleURI: "resource:///actors/AboutPrivateBrowsingParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/AboutPrivateBrowsingChild.jsm",

      events: {
        DOMWindowCreated: { capture: true },
      },
    },

    matches: ["about:privatebrowsing"],
  },

  AboutProtections: {
    parent: {
      moduleURI: "resource:///actors/AboutProtectionsParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/AboutProtectionsChild.jsm",

      events: {
        DOMWindowCreated: { capture: true },
      },
    },

    matches: ["about:protections", "about:protections?*"],
  },

  AboutReader: {
    parent: {
      moduleURI: "resource:///actors/AboutReaderParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/AboutReaderChild.jsm",
      events: {
        DOMContentLoaded: {},
        pageshow: { mozSystemGroup: true },
        pagehide: { mozSystemGroup: true },
      },
    },
    messageManagerGroups: ["browsers"],
  },

  AboutTabCrashed: {
    parent: {
      moduleURI: "resource:///actors/AboutTabCrashedParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/AboutTabCrashedChild.jsm",

      events: {
        DOMWindowCreated: { capture: true },
      },
    },

    matches: ["about:tabcrashed*"],
  },

  AboutWelcome: {
    parent: {
      moduleURI: "resource:///actors/AboutWelcomeParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/AboutWelcomeChild.jsm",
      events: {
        // This is added so the actor instantiates immediately and makes
        // methods available to the page js on load.
        DOMWindowCreated: {},
      },
    },
    matches: ["about:welcome"],
    remoteTypes: ["privilegedabout"],

    // See Bug 1618306
    // Remove this preference check when we turn on separate about:welcome for all users.
    enablePreference: "browser.aboutwelcome.enabled",
  },

  BlockedSite: {
    parent: {
      moduleURI: "resource:///actors/BlockedSiteParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/BlockedSiteChild.jsm",
      events: {
        AboutBlockedLoaded: { wantUntrusted: true },
        click: {},
      },
    },
    matches: ["about:blocked?*"],
    allFrames: true,
  },

  ClickHandler: {
    parent: {
      moduleURI: "resource:///actors/ClickHandlerParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/ClickHandlerChild.jsm",
      events: {
        click: { capture: true, mozSystemGroup: true },
        auxclick: { capture: true, mozSystemGroup: true },
      },
    },

    allFrames: true,
  },

  // Collects description and icon information from meta tags.
  ContentMeta: {
    parent: {
      moduleURI: "resource:///actors/ContentMetaParent.jsm",
    },

    child: {
      moduleURI: "resource:///actors/ContentMetaChild.jsm",
      events: {
        DOMMetaAdded: {},
      },
    },

    messageManagerGroups: ["browsers"],
  },

  ContentSearch: {
    parent: {
      moduleURI: "resource:///actors/ContentSearchParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/ContentSearchChild.jsm",
      events: {
        ContentSearchClient: { capture: true, wantUntrusted: true },
      },
    },
    matches: [
      "about:home",
      "about:welcome",
      "about:newtab",
      "about:privatebrowsing",
      "about:test-about-content-search-ui",
    ],
    remoteTypes: ["privilegedabout"],
  },

  ContextMenu: {
    parent: {
      moduleURI: "resource:///actors/ContextMenuParent.jsm",
    },

    child: {
      moduleURI: "resource:///actors/ContextMenuChild.jsm",
      events: {
        contextmenu: { mozSystemGroup: true },
      },
    },

    allFrames: true,
  },

  DecoderDoctor: {
    parent: {
      moduleURI: "resource:///actors/DecoderDoctorParent.jsm",
    },

    child: {
      moduleURI: "resource:///actors/DecoderDoctorChild.jsm",
      observers: ["decoder-doctor-notification"],
    },

    messageManagerGroups: ["browsers"],
    allFrames: true,
  },

  DOMFullscreen: {
    parent: {
      moduleURI: "resource:///actors/DOMFullscreenParent.jsm",
    },

    child: {
      moduleURI: "resource:///actors/DOMFullscreenChild.jsm",
      group: "browsers",
      events: {
        "MozDOMFullscreen:Request": {},
        "MozDOMFullscreen:Entered": {},
        "MozDOMFullscreen:NewOrigin": {},
        "MozDOMFullscreen:Exit": {},
        "MozDOMFullscreen:Exited": {},
      },
    },

    allFrames: true,
  },

  EncryptedMedia: {
    parent: {
      moduleURI: "resource:///actors/EncryptedMediaParent.jsm",
    },

    child: {
      moduleURI: "resource:///actors/EncryptedMediaChild.jsm",
      observers: ["mediakeys-request"],
    },

    messageManagerGroups: ["browsers"],
    allFrames: true,
  },

  FormValidation: {
    parent: {
      moduleURI: "resource:///actors/FormValidationParent.jsm",
    },

    child: {
      moduleURI: "resource:///actors/FormValidationChild.jsm",
      events: {
        MozInvalidForm: {},
      },
    },

    allFrames: true,
  },

  LightweightTheme: {
    child: {
      moduleURI: "resource:///actors/LightweightThemeChild.jsm",
      events: {
        pageshow: { mozSystemGroup: true },
        DOMContentLoaded: {},
      },
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
    ],
  },

  LinkHandler: {
    parent: {
      moduleURI: "resource:///actors/LinkHandlerParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/LinkHandlerChild.jsm",
      events: {
        DOMHeadElementParsed: {},
        DOMLinkAdded: {},
        DOMLinkChanged: {},
        pageshow: {},
        pagehide: {},
      },
    },

    messageManagerGroups: ["browsers"],
  },

  NetError: {
    parent: {
      moduleURI: "resource:///actors/NetErrorParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/NetErrorChild.jsm",
      events: {
        DOMWindowCreated: {},
        click: {},
      },
    },

    matches: ["about:certerror?*", "about:neterror?*"],
    allFrames: true,
  },

  PageInfo: {
    child: {
      moduleURI: "resource:///actors/PageInfoChild.jsm",
    },

    allFrames: true,
  },

  PageStyle: {
    parent: {
      moduleURI: "resource:///actors/PageStyleParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/PageStyleChild.jsm",
      events: {
        pageshow: {},
      },
    },

    // Only matching web pages, as opposed to internal about:, chrome: or
    // resource: pages. See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
    matches: ["*://*/*", "file:///*"],
    messageManagerGroups: ["browsers"],
    allFrames: true,
  },

  Pdfjs: {
    parent: {
      moduleURI: "resource://pdf.js/PdfjsParent.jsm",
    },
    child: {
      moduleURI: "resource://pdf.js/PdfjsChild.jsm",
    },
    allFrames: true,
  },

  // GMP crash reporting
  Plugin: {
    parent: {
      moduleURI: "resource:///actors/PluginParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/PluginChild.jsm",
      events: {
        PluginCrashed: { capture: true },
      },
    },

    allFrames: true,
  },

  PointerLock: {
    parent: {
      moduleURI: "resource:///actors/PointerLockParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/PointerLockChild.jsm",
      events: {
        "MozDOMPointerLock:Entered": {},
        "MozDOMPointerLock:Exited": {},
      },
    },

    messageManagerGroups: ["browsers"],
    allFrames: true,
  },

  Prompt: {
    parent: {
      moduleURI: "resource:///actors/PromptParent.jsm",
    },
    includeChrome: true,
    allFrames: true,
  },

  RefreshBlocker: {
    parent: {
      moduleURI: "resource:///actors/RefreshBlockerParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/RefreshBlockerChild.jsm",
    },

    messageManagerGroups: ["browsers"],
    enablePreference: "accessibility.blockautorefresh",
  },

  SearchSERPTelemetry: {
    parent: {
      moduleURI: "resource:///actors/SearchSERPTelemetryParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/SearchSERPTelemetryChild.jsm",
      events: {
        DOMContentLoaded: {},
        pageshow: { mozSystemGroup: true },
        unload: {},
      },
    },
  },

  ShieldFrame: {
    parent: {
      moduleURI: "resource://normandy-content/ShieldFrameParent.jsm",
    },
    child: {
      moduleURI: "resource://normandy-content/ShieldFrameChild.jsm",
      events: {
        pageshow: {},
        pagehide: {},
        ShieldPageEvent: { wantUntrusted: true },
      },
    },
    matches: ["about:studies"],
  },

  ASRouter: {
    parent: {
      moduleURI: "resource:///actors/ASRouterParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/ASRouterChild.jsm",
      events: {
        // This is added so the actor instantiates immediately and makes
        // methods available to the page js on load.
        DOMWindowCreated: {},
      },
    },
    matches: ["about:home*", "about:newtab*", "about:welcome*"],
    remoteTypes: ["privilegedabout"],
  },

  SwitchDocumentDirection: {
    child: {
      moduleURI: "resource:///actors/SwitchDocumentDirectionChild.jsm",
    },

    allFrames: true,
  },

  Translation: {
    parent: {
      moduleURI: "resource:///modules/translation/TranslationParent.jsm",
    },
    child: {
      moduleURI: "resource:///modules/translation/TranslationChild.jsm",
      events: {
        pageshow: {},
        load: { mozSystemGroup: true, capture: true },
      },
    },
    enablePreference: "browser.translation.detectLanguage",
  },

  UITour: {
    parent: {
      moduleURI: "resource:///modules/UITourParent.jsm",
    },
    child: {
      moduleURI: "resource:///modules/UITourChild.jsm",
      events: {
        mozUITour: { wantUntrusted: true },
      },
    },

    messageManagerGroups: ["browsers"],
  },

  WebRTC: {
    parent: {
      moduleURI: "resource:///actors/WebRTCParent.jsm",
    },
    child: {
      moduleURI: "resource:///actors/WebRTCChild.jsm",
    },

    allFrames: true,
  },
};