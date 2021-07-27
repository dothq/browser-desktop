import { ChromeUtils } from ".";

const { JSWINDOWACTORS } = ChromeUtils.defineModuleGetter(
    window,
    "JSWINDOWACTORS",
    "resource:///modules/BrowserGlue.jsm"
);

export const windowActors = {
    ...JSWINDOWACTORS,

    LinkHandler: {
        parent: {
            moduleURI: "chrome://dot/content/actors/LinkHandlerParent.jsm",
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

    BrowserTab: {
        parent: {
            moduleURI: "chrome://dot/content/actors/BrowserTabParent.jsm",
        },
        child: {
            moduleURI: "resource:///actors/BrowserTabChild.jsm",

            events: {
                DOMWindowCreated: {},
                MozAfterPaint: {},
            },
        },

        messageManagerGroups: ["browsers"],
    },

    ContextMenu: {
        parent: {
            moduleURI: "chrome://dot/content/actors/ContextMenuParent.jsm",
        },

        child: {
            moduleURI: "resource:///actors/ContextMenuChild.jsm",
            events: {
                contextmenu: { mozSystemGroup: true },
            },
        },

        allFrames: true,
    },
};