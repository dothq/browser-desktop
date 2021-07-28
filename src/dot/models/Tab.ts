import { dot } from "../api";
import { store } from "../app/store";
import { Cc, ChromeUtils, Ci, Services } from "../modules";
import { WELCOME_SCREEN_URL_PARSED } from "../shared/tab";
import { formatToParts } from "../shared/url";
import { MozURI } from "../types/uri";

export interface ITab {
    url: string,
    background?: boolean,
    internal?: boolean
}

export class Tab {
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

    public url = "about:blank";

    public urlParts = {
        scheme: null,
        host: null,
        domain: null,
        path: null,
        query: null,
        hash: null,
        internal: true
    };

    public internal: boolean = false;

    public get active() {
        return dot.tabs.selectedTabId == this.id;
    }

    public canGoBack: boolean = false;

    public canGoForward: boolean = false;

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
        return this.url == WELCOME_SCREEN_URL_PARSED.spec;
    }

    public faviconUrl: any;

    public webContents: any;

    constructor({
        url,
        background,
        internal
    }: ITab) {
        const browser = dot.browsersPrivate.create({
            background: !!background,
            internal: this.internal || false
        }, internal ? undefined : Services.io.newURI(url));

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
        this.webContents.destroy();
        this.webContents.remove();
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
        if (!request) return;

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

        if (location.spec == WELCOME_SCREEN_URL_PARSED.spec)
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
}