import { dot } from "../app";
import { Cc, ChromeUtils, Ci, E10SUtils, Services } from "../modules";
import { observable, computed } from "mobx";
import { MozURI } from "../types/uri";

export interface ITab {
    url: MozURI,
    background?: boolean
}

export class Tab {
    public id: number;

    public background: boolean;

    public state: 'loading' | 'idle' | 'unknown' = 'unknown';

    public get url() {
        return this.webContents.currentURI.spec;
    }

    public get navigationState() {
        return {
            goBack: this.webContents.canGoBack,
            goForward: this.webContents.canGoForward
        }
    }

    public webContents: any;

    constructor({
        url,
        background
    }: ITab) {
        let browser: HTMLElement | any = document.createXULElement("browser");

        this.webContents = browser;
        this.id = this.webContents.browserId;

        const attributes = {
            type: "content",
            context: "contentAreaContextMenu",
            tooltip: "aHTMLTooltip",
            autocompletepopup: "PopupAutoComplete",
            selectmenulist: "ContentSelectDropdown",
            message: true,
            messagemanagergroup: "browsers",
            remote: true,
            maychangeremoteness: true
        }

        for(const [key, val] of Object.entries(attributes)) {
            this.webContents.setAttribute(key, val.toString());
        }
        
        let oa = E10SUtils.predictOriginAttributes({ browser: this.webContents });
    
        const { useRemoteTabs } = window.docShell.QueryInterface(Ci.nsILoadContext);
        const remoteType = E10SUtils.getRemoteTypeForURI(
            url.spec,
            useRemoteTabs /* is multi process browser */,
            false /* fission */,
            E10SUtils.DEFAULT_REMOTE_TYPE,
            null,
            oa
        );

        this.webContents.setAttribute(
            "remoteType",
            remoteType
        );

        const tabsStack = document.getElementById("browser-tabs-stack");
        tabsStack?.appendChild(this.webContents);

        if(!background) dot.tabs.selectedTabId = this.id;

        this.goto(url);

        tabsStack?.style.setProperty(`--split`, `${100 / (dot.tabs.list.length + 1)}%`)

        this.background = !!background;

        const { id: tabId, webContents: { webProgress } } = this;

        const progressListener = {
            onStateChange(webProgress: any, request: any, flags: number, status: any) {
                const url = request.QueryInterface(Ci.nsIChannel).originalURI.spec;

                if (url == "about:blank") {
                  return;
                };

                const loadingBtn: any = document.getElementById("loading-button");

                loadingBtn.style.display = webProgress.isLoadingDocument
                    ? ""
                    : "none";

                console.log("onStateChange", webProgress, request, flags, status);
            },

            onLocationChange(progress: any, request: any, location: MozURI, flags: number) {
                const url = request.QueryInterface(Ci.nsIChannel).originalURI.spec;

                if (!progress.isTopLevel) {
                    return;
                }
                // Ignore events that don't change the document
                if (flags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT) {
                    return;
                }
                // Ignore the initial about:blank, unless about:blank is requested
                if (location.spec == "about:blank" && url != "about:blank") {
                    return;
                }

                console.log(location.spec);
        
                dot.titlebar.emit(`page-location-change`, tabId);
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

        webProgress.addProgressListener(
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

        return this;
    }

    goto(uri: MozURI) {
        let triggeringPrincipal = Services.scriptSecurityManager.getSystemPrincipal();

        this.webContents.loadURI(uri.spec, { triggeringPrincipal });
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
}