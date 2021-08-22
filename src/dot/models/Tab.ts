import EventEmitter from "events";
import { dot } from "../api";
import { store } from "../app/store";
import { Cc, ChromeUtils, Ci, Services } from "../modules";
import { NEW_TAB_URL_PARSED } from "../shared/tab";
import { formatToParts } from "../shared/url";
import { MozURI } from "../types/uri";

const { DevToolsShim } = ChromeUtils.import(
    "chrome://devtools-startup/content/DevToolsShim.jsm"
);

export interface ITab {
    url: string,
    background?: boolean
    id?: string
}

export class Tab extends EventEmitter {
    public id: number;

    public background: boolean;

    private _state: 'loading' | 'idle' | 'unknown' = "loading";

    public get state() {
        return this._state;
    }

    public set state(state: 'loading' | 'idle' | 'unknown') {
        this._state = state;

        store.dispatch({
            type: "TAB_UPDATE_STATE",
            payload: {
                id: this.id,
                state
            }
        });

        if (state == "loading") {
            store.dispatch({
                type: "TAB_UPDATE_FAVICON",
                payload: {
                    id: this.id,
                    faviconUrl: ""
                }
            });
        }
    }

    public get url() {
        // tab might be dead
        if (
            !this.webContents ||
            !this.webContents.currentURI
        ) return "about:blank";

        return this.webContents.currentURI.spec;
    };

    public urlParts = {
        scheme: null,
        host: null,
        domain: null,
        path: null,
        query: null,
        hash: null,
        internal: true
    };

    public get active() {
        return dot.tabs.selectedTabId == this.id;
    }

    public canGoBack: boolean = false;
    public canGoForward: boolean = false;

    private _pageStatus: string | undefined = "";

    public get pageStatus() {
        return this._pageStatus;
    }

    public set pageStatus(url: string | undefined) {
        this._pageStatus = url;

        const container = dot.tabs.getBrowserContainer(this.webContents);
        const status = container.querySelector(".browserStatus");

        if (url) {
            status.innerText = url;
            status.setAttribute("data-visible", "true");
        } else {
            status.removeAttribute("data-visible");

            setTimeout(() => {
                status.setAttribute("data-side", "left");
            }, 200); // this should be updated with the fade in transition amount
        }
    }

    public bookmarked: boolean = false;

    public bookmark() {
        console.log("stub - bookmark");
    }

    public unBookmark() {
        console.log("stub - unbookmark");
    }

    public updateNavigationState() {
        store.dispatch({
            type: "TAB_UPDATE_NAVIGATION_STATE",
            payload: {
                id: this.id,
                canGoBack: this.webContents.canGoBack,
                canGoForward: this.webContents.canGoForward
            }
        })
    }

    public toggleDevTools(target: any) {
        return DevToolsShim.inspectNode(
            this,
            target
        );
    }

    public pageState:
        'search' |
        'info' |
        'warning' |
        'built-in' |
        'http' |
        'https' |
        'https-unsecure' |
        'extension' |
        'file' = "search"

    private _title: string = "";

    public get title() {
        return this._title;
    }

    public set title(title: string) {
        this._title = title;

        store.dispatch({
            type: "TAB_UPDATE_TITLE",
            payload: {
                id: this.id,
                title,
                noInvalidate: true
            }
        });
    }

    public isNewTab() {
        return this.url == NEW_TAB_URL_PARSED.spec;
    }

    public faviconUrl: any;

    public isClosing: boolean = false;

    public webContents: any;

    // this is here for compatibility with devtools
    public get linkedBrowser() {
        return this.webContents;
    }

    public tagName = "tab"

    constructor({
        url,
        background,
        id
    }: ITab) {
        super();

        const browser = dot.browsersPrivate.create({
            background: !!background,
            id
        }, Services.io.newURI(url));

        this.webContents = browser;
        this.id = this.webContents.browserId;
        this.background = !!background;

        this.createProgressListener();

        this.webContents.addEventListener(
            "WillChangeBrowserRemoteness",
            this.onBrowserRemoteChange
        );

        this.webContents.addEventListener(
            "pagetitlechanged",
            this.onPageTitleChange
        );

        return this;
    }

    public goto(uri: MozURI, options?: any) {
        dot.browsersPrivate.goto(this.id, uri, options);
    }

    public goBack() {
        this.webContents.goBack();
        this.updateNavigationState();
    }

    public goForward() {
        this.webContents.goForward();
        this.updateNavigationState();
    }

    public reload(flags?: number) {
        this.state = "loading"; // start loading

        if (!flags) {
            flags = Ci.nsIWebNavigation.LOAD_FLAGS_NONE;
        };

        this.webContents.reloadWithFlags(flags);
        this.updateNavigationState();
    }

    public destroy() {
        this.emit("TabClose");

        const tabsIndex = dot.tabs.list.findIndex(x => x.id == this.id);
        let browserContainer = dot.tabs.getBrowserContainer(this.webContents).parentNode;

        store.dispatch({
            type: "TAB_KILL",
            payload: this.id
        });

        this.webContents.destroy();
        this.webContents.remove();
        browserContainer.remove();

        if (dot.tabs.list.length == 0) {
            return window.close();
        }

        /*
            Current Tab Index: 1
            Next Tab Index: 2 (1 + 1)
            Tabs Length: 3
            Result: new index (2) is less than or equal to the tabs length (3)
                    so we just change the selected tab to the next tab along
        */
        // if ((tabsIndex + 1) <= dot.tabs.list.length) {

        // }

        // if ((tabsIndex + 1))
    }

    public select() {
        dot.browsersPrivate.select(this.id);
    }

    public createProgressListener() {
        const progressListener = {
            onStateChange: (webProgress: any, request: any, flags: number, status: any) => {
                this.onStateChange(this.id, webProgress, request, flags, status);
            },

            onLocationChange: (webProgress: any, request: any, location: MozURI, flags: any) => {
                this.onLocationChange(this.id, webProgress, request, location, flags);
            },

            QueryInterface: ChromeUtils.generateQI([
                "nsIWebProgressListener",
                "nsISupportsWeakReference",
            ]),
        }

        let filter = Cc[
            "@mozilla.org/appshell/component/browser-status-filter;1"
        ].createInstance(Ci.nsIWebProgress);

        filter.addProgressListener(progressListener, Ci.nsIWebProgress.NOTIFY_ALL);
        dot.tabs.tabListeners.set(this.id, progressListener);
        dot.tabs.tabFilters.set(this.id, filter);

        this.webContents.webProgress.addProgressListener(
            filter,
            Ci.nsIWebProgress.NOTIFY_ALL
        );
    }

    public onStateChange(id: number, webProgress: any, request: any, flags: number, status: any) {
        if (!request) return console.log("request is null, ignoring state change");

        dot.tabs.get(id)?.updateNavigationState();

        const shouldShowLoader = (request: any) => {
            // We don't want to show tab loaders for about:* urls
            if (
                request instanceof Ci.nsIChannel &&
                request.originalURI.schemeIs("about")
            ) return false;

            return true;
        }

        const {
            STATE_START,
            STATE_IS_NETWORK,
            STATE_RESTORING,
            STATE_STOP
        } = Ci.nsIWebProgressListener;

        if (
            flags & STATE_START &&
            flags & STATE_IS_NETWORK
        ) {
            if (shouldShowLoader(request)) {
                if (
                    !(flags & STATE_RESTORING) &&
                    webProgress &&
                    webProgress.isTopLevel
                ) {
                    // having two dispatches probably isn't best
                    // merge these two in future maybe?

                    // started loading
                    store.dispatch({
                        type: "TAB_UPDATE_STATE",
                        payload: {
                            id,
                            state: "loading"
                        }
                    });

                    // remove the favicon during loading
                    // we don't want it flickering about during the load
                    store.dispatch({
                        type: "TAB_UPDATE_FAVICON",
                        payload: {
                            id,
                            faviconUrl: ""
                        }
                    });
                }
            }
        } else if (
            flags & STATE_STOP &&
            flags & STATE_IS_NETWORK
        ) {
            // finished loading
            store.dispatch({
                type: "TAB_UPDATE_STATE",
                payload: {
                    id,
                    state: "idle"
                }
            });
        }
    }

    public onLocationChange(id: number, webProgress: any, request: any, location: MozURI, flags: any) {
        if (!webProgress.isTopLevel) return;

        // Ignore the initial about:blank, unless about:blank is requested
        if (request) {
            const url = request.QueryInterface(Ci.nsIChannel).originalURI.spec;
            if (location.spec == "about:blank" && url != "about:blank") return;
        }

        dot.tabs.get(id)?.updateNavigationState();

        let pageState = "info";

        if (location.spec == NEW_TAB_URL_PARSED.spec)
            pageState = "search"
        else if (location.scheme == "https") pageState = "https"
        else if (location.scheme == "http") pageState = "http"
        else if (location.scheme == "moz-extension") pageState = "extension"
        else if (
            location.scheme == "about"
        ) pageState = "built-in"
        else if (
            location.scheme == "file" ||
            location.scheme == "chrome" ||
            location.scheme == "resource"
        ) pageState = "file"

        if (location.spec == "about:blank") pageState = "info";

        const urlParts = formatToParts(location.spec);

        store.dispatch({
            type: "TAB_UPDATE",
            payload: {
                id,
                url: location.spec,
                pageState,
                urlParts
            }
        });
    }

    public onBrowserRemoteChange(event: any) {
        let { browserId } = event.originalTarget;
        let tab: any = dot.tabs.get(browserId);
        if (!tab) {
            return;
        }

        store.dispatch({
            type: "TAB_UPDATE_FAVICON",
            payload: {
                id: browserId,
                faviconUrl: ""
            }
        });

        // Dispatch the `BeforeTabRemotenessChange` event, allowing other code
        // to react to this tab's process switch.
        let evt = document.createEvent("Events");
        evt.initEvent("BeforeTabRemotenessChange", true, false);
        tab.dispatchEvent(evt);

        // Unhook our progress listener.
        let filter = dot.tabs.tabFilters.get(browserId);
        let oldListener = dot.tabs.tabListeners.get(browserId);

        this.webContents.webProgress.removeProgressListener(filter);
        filter.removeProgressListener(oldListener);

        // We'll be creating a new listener, so destroy the old one.
        oldListener = null;
    }

    public onPageTitleChange(event: any) {
        let { browserId } = event.originalTarget;
        let tab = dot.tabs.get(browserId);

        if (!tab) return;

        // Ignore empty title changes on internal pages. This prevents the title
        // from changing while Fluent is populating the (initially-empty) title
        // element.
        if (
            !tab.webContents.contentTitle &&
            tab.webContents.contentPrincipal.isSystemPrincipal
        ) return;

        tab.title = tab.webContents.contentTitle;
    }

    public addEventListener(event: string | symbol, listener: (...args: any[]) => void) {
        this.addListener(event, listener);
    }

    public get ownerGlobal() {
        return this.webContents.ownerGlobal;
    }

    public get ownerDocument() {
        return this.webContents.ownerDocument;
    }
}