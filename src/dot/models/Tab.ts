import { dot } from "../api";
import { store } from "../app/store";
import { Cc, ChromeUtils, Ci, Services } from "../modules";
import { MozURI } from "../types/uri";

export interface ITab {
    url: string,
    background?: boolean
}

export class Tab {
    public id: number;

    public background: boolean;

    public state: 'loading' | 'idle' | 'unknown' = 'unknown';

    public url = "about:blank";

    public urlParts = {
        scheme: "about:",
        host: "blank",
        domain: null,
        path: null,
        internal: true
    };

    public get active() {
        return dot.tabs.selectedTabId == this.id;
    }

    public canGoBack: boolean = false;
    
    public canGoForward: boolean = false;

    public bookmarked: boolean = false;

    public bookmark() {
        console.log("stub");
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

    public title: string = "";

    public faviconUrl: any;

    public webContents: any;

    constructor({
        url,
        background
    }: ITab) {
        const browser = dot.browsersPrivate.create({
            type: "content",
            context: "contentAreaContextMenu",
            tooltip: "aHTMLTooltip",
            autocompletepopup: "PopupAutoComplete",
            selectmenulist: "ContentSelectDropdown",
            message: true,
            messagemanagergroup: "browsers",
            remote: true,
            maychangeremoteness: true,
            
            background: !!background
        }, Services.io.newURI(url));

        this.webContents = browser;
        this.id = this.webContents.browserId;

        this.background = !!background;

        const tab = this;

        const progressListener = {
            onStateChange(webProgress: any, request: any, flags: number, status: any) {
                if (!request) return;

                const url = request.QueryInterface(Ci.nsIChannel).originalURI.spec;

                if (url == "about:blank") {
                  return;
                };
                
                () => tab.updateNavigationState();

                let state = "unknown";

                if (request.isLoadingDocument) state = "loading"
                else state = "idle"

                store.dispatch({
                    type: "TAB_UPDATE_STATE",
                    payload: {
                        id: tab.id,
                        state
                    }
                });

                console.log("onStateChange", webProgress, request.loadInfo, flags, status);
            },

            onLocationChange(progress: any, request: any, location: MozURI, flags: number) {
                if (!progress.isTopLevel) return;
                
                // Ignore the initial about:blank, unless about:blank is requested
                if (request) {
                    const url = request.QueryInterface(Ci.nsIChannel).originalURI.spec;
                    if (location.spec == "about:blank" && url != "about:blank") return;
                }

                const whitelistedSchemes = [
                    "http",
                    "https",
                    "ws",
                    "wss",
                    "file",
                    "ftp",
                    "moz-extension",
                    "chrome",
                    "resource",
                    "moz",
                    "moz-icon",
                    "moz-gio"
                ]

                const isHttp = location.scheme.startsWith("http");
                const rootDomain = isHttp ? Services.eTLD.getBaseDomainFromHost(location.host) : "";
                const notWhitelisted = !whitelistedSchemes.includes(location.scheme);
                const noTrailingPath = location.pathQueryRef.replace(/\/*$/, "");

                let pageState = "search";

                if(location.scheme == "https") pageState = "https"
                else if (location.scheme == "http") pageState = "http"
                else if (location.scheme == "moz-extension") pageState = "extension"
                else if (
                    location.scheme == "about" ||
                    location.scheme == "data"
                ) pageState = "info"
                else if (
                    location.scheme == "file" ||
                    location.scheme == "chrome" ||
                    location.scheme == "resource"
                ) pageState = "file"

                const scheme = whitelistedSchemes.includes(location.scheme)
                    ? `${location.scheme}://`
                    : `${location.scheme}:`

                store.dispatch({
                    type: "TAB_UPDATE",
                    payload: {
                        id: tab.id,
                        url: location.spec,
                        pageState,
                        urlParts: {
                            scheme,
                            domain: notWhitelisted
                                ? location.pathQueryRef
                                : rootDomain,
                            host: notWhitelisted
                                ? ""
                                : location.host.replace(rootDomain, ""),
                            path: notWhitelisted
                                ? ""
                                : noTrailingPath,
                            internal: !isHttp
                        }
                    }
                });
        
                dot.titlebar.emit(`page-location-change`, tab.id);
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

        tab.webContents.webProgress.addProgressListener(
            filter,
            Ci.nsIWebProgress.NOTIFY_ALL
        );

        this.webContents.addEventListener("WillChangeBrowserRemoteness", (event: any) => {
            let { id } = event.originalTarget;
            let tab: any = dot.tabs.get(id);
            if (!tab) {
              return;
            }
    
            // Dispatch the `BeforeTabRemotenessChange` event, allowing other code
            // to react to this tab's process switch.
            let evt = document.createEvent("Events");
            evt.initEvent("BeforeTabRemotenessChange", true, false);
            tab.dispatchEvent(evt);

            // Unhook our progress listener.
            let filter = dot.tabs.tabFilters.get(id);
            let oldListener = dot.tabs.tabListeners.get(id);

            this.webContents.webProgress.removeProgressListener(filter);
            filter.removeProgressListener(oldListener);

            // We'll be creating a new listener, so destroy the old one.
            oldListener = null; 
        });

        this.webContents.addEventListener("pagetitlechanged", (event: any) => {
            if (this.state !== "idle") return;

            // Ignore empty title changes on internal pages. This prevents the title
            // from changing while Fluent is populating the (initially-empty) title
            // element.
            if (
                !browser.contentTitle &&
                browser.contentPrincipal.isSystemPrincipal
            ) return;

            if (this.title == browser.contentTitle) return;

            store.dispatch({
                type: "TAB_UPDATE_TITLE",
                payload: {
                    id: this.id,
                    title: browser.contentTitle
                }
            });
        });

        this.webContents.addEventListener("contextmenu", (event: MouseEvent) => {
            dot.menu.get("context-navigation")?.toggle(event);
        });

        return this;
    }

    goto(uri: MozURI, options?: any) {
        dot.browsersPrivate.goto(this.id, uri, options);
    }

    goBack() {
        this.webContents.goBack();
    }

    goForward() {
        this.webContents.goForward();
    }

    reload(flags?: number) {
        if(!flags) {
            flags = Ci.nsIWebNavigation.LOAD_FLAGS_NONE;
        };

        this.webContents.reloadWithFlags(flags);
    }

    destroy() {
        this.webContents.destroy();
        this.webContents.remove();
    }

    select() {
        dot.browsersPrivate.select(this.id);
    }
}