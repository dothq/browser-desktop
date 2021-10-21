import EventEmitter from "events";
import { action, computed, makeObservable, observable } from "mobx";
import React from "react";
import { dot } from "../api";
import { ipc } from "../core/ipc";
import { ThumbnailManager } from "../core/thumbnails";
import {
    Cc,
    ChromeUtils,
    Ci,
    E10SUtils,
    Services
} from "../modules";
import IdentityManager from "../services/identity";
import { TabProgressListener } from "../services/progress";
import { zoomManager } from "../services/zoom";
import { openMenuAt } from "../shared/menu";
import { isBlankPageURL } from "../shared/url";
import { MozURI } from "../types/uri";
import { gFissionBrowser } from "../utils/browser";

const { DevToolsShim } = ChromeUtils.import(
    "chrome://devtools-startup/content/DevToolsShim.jsm"
);

export interface ITab {
    url: string;
    background?: boolean;
    id?: string;
}

export class Tab extends EventEmitter {
    @observable
    public id: number;

    @observable
    public background: boolean;

    @observable
    public state: "loading" | "idle" | "unknown" =
        "loading";

    /*
        busy - looking up address / first connect to server
        progress - received contents, loading scripts and media
        <empty> - idle (we're done here)
    */
    @observable
    public loadingStage: "busy" | "progress" | "" = "";

    @computed
    public get url() {
        return this.urlParsed.spec;
    }

    @computed
    public get urlParsed(): MozURI {
        // tab might be dead
        if (
            !this.webContents ||
            !this.webContents.currentURI
        )
            return Services.io.newURI("about:blank");

        return this.webContents.currentURI;
    }

    @computed
    public get host() {
        let host = undefined;

        try {
            host = this.urlParsed.host;
        } catch(e) {}

        return host;
    }

    @computed
    public get active() {
        return dot.tabs.selectedTabId == this.id;
    }

    public set active(val: boolean) {
        if(val) this.select();
    }

    @computed
    public get tooltip() {
        const label = [
            this.title
        ]

        const developerDetailsEnabled = dot.prefs.get(
            "browser.tabs.tooltipsShowPidAndActiveness",
            false
        );

        if(developerDetailsEnabled) {
            const [contentPid, ...framePids] = E10SUtils.getBrowserPids(
                this.webContents,
                gFissionBrowser
            );

            if(contentPid) label[0] = `${label[0]} (pid ${contentPid})`;

            if(gFissionBrowser) {
                label[0] = `${label[0]} [F`;

                if(framePids.length) label[0] = `${label[0]} ${framePids.join(", ")}`;

                label[0] = `${label[0]}]`;
            }

            if(this.active) {
                label[0] = `${label[0]} [A]`;
            }
        }

        label.push(this.urlParsed.spec.split(/[?#]/)[0]);

        return label.join("\n");
    }

    @observable
    public hovering: boolean = false;

    @observable
    public canGoBack: boolean = false;
    
    @observable
    public canGoForward: boolean = false;

    private _pageStatus: string | undefined = "";

    @computed
    public get pageStatus() {
        return this._pageStatus;
    }

    public set pageStatus(url: string | undefined) {
        this._pageStatus = url;

        const container = dot.tabs.getBrowserContainer(
            this.webContents
        );
        const status = container.querySelector(
            ".browserStatus"
        );

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

    @observable
    public pinned: boolean = false;

    @observable
    public bookmarked: boolean = false;

    @action
    public bookmark() {
        console.log("stub - bookmark");
    }

    @action
    public unBookmark() {
        console.log("stub - unbookmark");
    }

    @action
    public updateNavigationState() {
        this.canGoBack = this.webContents.canGoBack;
        this.canGoForward = this.webContents.canGoForward;
    }

    @action
    public toggleDevTools(target: any) {
        return DevToolsShim.inspectNode(this, target);
    }

    @observable
    public title: string;
    
    @action
    public updateTitle() {
        const browser = this.webContents;

        let { currentURI, contentTitle } = browser;

        const isContentTitle = !!contentTitle;
        if (!contentTitle) {
            if (currentURI.displaySpec) {
                try {
                    contentTitle = Services.io.createExposableURI(
                        browser.currentURI
                    ).displaySpec;
                } catch (ex) {
                    contentTitle = browser.currentURI.displaySpec;
                }
            }
    
            if (contentTitle && !isBlankPageURL(contentTitle)) {
                if (
                    contentTitle.length > 500 && 
                    contentTitle.match(/^data:[^,]+;base64,/)
                ) {
                    contentTitle = `${contentTitle.substring(0, 500)}\u2026`;
                } else {
                    // Try to unescape not-ASCII URIs using the current character set.
                    try {
                        const { characterSet } = browser;

                        contentTitle = Services.textToSubURI.unEscapeNonAsciiURI(
                            characterSet,
                            contentTitle
                        );
                    } catch (e) {}
                }
            } else {
                contentTitle = "Untitled";
            }
        }

        if(!isContentTitle) {
            contentTitle = contentTitle
                .replace(/^[^:]+:\/\/(?:www\.)?/, "");
        }

        this.title = contentTitle;

        dot.window.updateWindowTitle();
        
        return contentTitle;
    }

    @computed
    public get zoom() {
        return zoomManager.getZoomOfTab(this.id);
    }

    public set zoom(zoom: number) {
        zoomManager.setZoomForTab(this.id, zoom);
    }

    @computed
    public get zoomManager() {
        return zoomManager;
    }

    @computed
    public get thumbnails() {
        return new ThumbnailManager(this);
    }

    @observable
    public initialIconHidden: boolean = false;

    @observable
    public faviconUrl: any;
    public faviconLoadingPrincipal: any;

    @observable
    public pendingIcon: boolean = false;

    @action
    public setIcon(
        iconURL: string,
        originalURL = iconURL,
        loadingPrincipal: any
    ) {
        const makeString = (url: any) => (url instanceof Ci.nsIURI ? url.spec : url);

        iconURL = makeString(iconURL);
        originalURL = makeString(originalURL);

        const LOCAL_PROTOCOLS = ["chrome:", "about:", "resource:", "data:"];

        if (
            iconURL &&
            !loadingPrincipal &&
            !LOCAL_PROTOCOLS.some(protocol => iconURL.startsWith(protocol))
        ) {
            console.error(
                `Attempt to set a remote URL ${iconURL} as a tab icon without a loading principal.`
            );
            return;
        }

        this.webContents.mIconURL = iconURL;
        this.faviconLoadingPrincipal = loadingPrincipal;
        this.faviconUrl = iconURL;
        this.pendingIcon = false;
    }

    @action
    public clearPendingIcon() {
        this.faviconUrl = "";
        this.pendingIcon = false;
    }

    @observable
    public isClosing: boolean = false;

    @observable
    public contentState: any;

    @computed
    public get identityManager() {
        return new IdentityManager(this);
    }

    @action
    public onTabMouseOver() {
        this.hovering = true;
    }

    @action
    public onTabMouseLeave() {
        this.hovering = false;
    }

    @action
    public onTabMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();

        switch(e.button) {
            // Left click
            case 0:
                this.select();

                break;
            // Middle click
            case 1:
                this.destroy();

                break;
            // Right click
            case 2:
                openMenuAt({
                    name: "TabMenu",
                    bounds: [e.clientX, e.clientY],
                    ctx: { tabId: this.id }
                });

                break;
            // Back mouse button
            case 3:
                this.goBack();

                break;
            // Forward mouse button
            case 4:
                this.goForward();

                break;
        }
    }

    public webContents: any;

    // this is here for compatibility with devtools
    public get linkedBrowser() {
        return this.webContents;
    }

    public tagName = "tab";

    constructor(args: Partial<Tab>) {
        super();

        makeObservable(this);

        const parsed = Services.io.newURI(args.url);

        const browser = dot.browsersPrivate.create(
            {
                background: !!args.background,
                id: args.id
            },
            parsed
        );

        this.webContents = browser;
        this.id = this.webContents.browserId;
        this.background = !!args.background;
        this.initialIconHidden = !!args.initialIconHidden;
        this.title = args.title ? args.title : "";

        this.createProgressListener();

        this.webContents.addEventListener(
            "pagetitlechanged",
            (e: any) => this.onPageTitleChange(e)
        );

        this.webContents.addEventListener(
            "DOMWindowClose",
            (e: any) => this.onRequestTabClose(e)
        );

        ipc.fire("tab-created", this.id);

        return this;
    }

    @action
    public goto(uri: MozURI | string, options?: any) {
        let parsed: MozURI;

        if (!(uri instanceof Ci.nsIURI)) {
            try {
                parsed = Services.io.newURI(uri);
            } catch (e) {
                throw e;
            }
        } else {
            parsed = uri as MozURI;
        }

        dot.browsersPrivate.goto(
            this.id,
            parsed,
            options
        );
    }

    @action
    public goBack() {
        this.webContents.goBack();
        this.updateNavigationState();
    }

    @action
    public goForward() {
        this.webContents.goForward();
        this.updateNavigationState();
    }

    @action
    public reload(flags?: number) {
        this.state = "loading"; // start loading

        if (!flags) {
            flags = Ci.nsIWebNavigation.LOAD_FLAGS_NONE;
        }

        this.webContents.reloadWithFlags(flags);
        this.updateNavigationState();
    }

    @action
    public stop() {
        this.webContents.stop();
        this.updateNavigationState();
    }

    @action
    public destroy() {
        const tabIndex = dot.tabs.list.findIndex(
            (tab) => tab.id == this.id
        );

        this.emit("TabClose");

        this.isClosing = true;

        const filteredList = dot.tabs.list.filter(
            (x) => !x.isClosing
        );

        // close early because there is no need to destroy a browser
        // that will be destroyed on window close
        if (filteredList.length == 0)
            return window.close();

        let browserContainer =
            dot.tabs.getBrowserContainer(
                this.webContents
            ).parentNode;

        dot.tabs.list = dot.tabs.list.filter(
            (t) => t.id !== this.id
        );

        this.webContents.destroy();
        this.webContents.remove();
        browserContainer.remove();

        const activeTabs = dot.tabs.list.filter(
            (tab) => tab.id != this.id
        );

        let newIndex;

        if (activeTabs.length > tabIndex) {
            newIndex = tabIndex;
        } else {
            newIndex = tabIndex - 1;
        }

        const newTab = dot.tabs.list[newIndex];
        
        newTab.select();

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

    @action
    public select() {
        dot.browsersPrivate.select(this.id);
    }

    public emit(
        event: string | symbol,
        ...args: any[]
    ): boolean {
        console.debug(
            `Tab ${this.id} dispatched: ${String(event)}`,
            ...args
        );

        return super.emit(event, ...args);
    }

    public createProgressListener() {
        let filter = Cc[
            "@mozilla.org/appshell/component/browser-status-filter;1"
        ].createInstance(Ci.nsIWebProgress);

        const progressListener = new TabProgressListener(
            this.id
        );

        filter.addProgressListener(
            progressListener,
            Ci.nsIWebProgress.NOTIFY_ALL
        );
        dot.tabs.tabListeners.set(
            this.id,
            progressListener
        );
        dot.tabs.tabFilters.set(this.id, filter);

        this.webContents.webProgress.addProgressListener(
            filter,
            Ci.nsIWebProgress.NOTIFY_ALL
        );
    }

    public onPageTitleChange(event: any) {
        // Ignore empty title changes on internal pages. This prevents the title
        // from changing while Fluent is populating the (initially-empty) title
        // element.
        if (
            !this.webContents.contentTitle &&
            this.webContents.contentPrincipal
                .isSystemPrincipal
        )
            return;

        this.updateTitle();
    }

    public onRequestTabClose(event: any) {
        let browser = event.target;

        if (!browser.isRemoteBrowser) {
            if (!event.isTrusted) return;

            browser =
                event.target.docShell.chromeEventHandler;
        }

        if (dot.tabs.list.length == 1)
            return window.close();

        this.destroy();

        event.preventDefault();
    }

    public addEventListener(
        event: string | symbol,
        listener: (...args: any[]) => void
    ) {
        this.addListener(event, listener);
    }

    public get ownerGlobal() {
        return this.webContents.ownerGlobal;
    }

    public get ownerDocument() {
        return this.webContents.ownerDocument;
    }
}
