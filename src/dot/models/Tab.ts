import EventEmitter from "events";
import { dot } from "../api";
import { store } from "../app/store";
import {
    Cc,
    ChromeUtils,
    Ci,
    Services
} from "../modules";
import IdentityManager from "../services/identity";
import { TabProgressListener } from "../services/progress";
import { zoomManager } from "../services/zoom";
import { predefinedFavicons } from "../shared/url";
import { MozURI } from "../types/uri";

const { DevToolsShim } = ChromeUtils.import(
    "chrome://devtools-startup/content/DevToolsShim.jsm"
);

export interface ITab {
    url: string;
    background?: boolean;
    id?: string;
}

export class Tab extends EventEmitter {
    public id: number;

    public background: boolean;

    private _state: "loading" | "idle" | "unknown" =
        "loading";

    public get state() {
        return this._state;
    }

    public set state(
        state: "loading" | "idle" | "unknown"
    ) {
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
                type: "TAB_UPDATE",
                payload: {
                    id: this.id,
                    faviconUrl: "",
                    initialIconHidden: false
                }
            });
        }
    }

    public get url() {
        return this.urlParsed.spec;
    }

    public get urlParsed(): MozURI {
        // tab might be dead
        if (
            !this.webContents ||
            !this.webContents.currentURI
        )
            return Services.io.newURI("about:blank");

        return this.webContents.currentURI;
    }

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

    public pinned: boolean = false;

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
                canGoForward:
                    this.webContents.canGoForward
            }
        });
    }

    public toggleDevTools(target: any) {
        return DevToolsShim.inspectNode(this, target);
    }

    public _title: string = "";

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

    public get zoom() {
        return zoomManager.getZoomOfTab(this.id);
    }

    public set zoom(zoom: number) {
        zoomManager.setZoomForTab(this.id, zoom);
    }

    public get zoomManager() {
        return zoomManager;
    }

    public initialIconHidden: boolean = false;

    public faviconUrl: any;

    public isClosing: boolean = false;

    public contentState: any;

    public get identityManager() {
        return new IdentityManager(this);
    }

    public webContents: any;

    // this is here for compatibility with devtools
    public get linkedBrowser() {
        return this.webContents;
    }

    public tagName = "tab";

    constructor(args: Partial<Tab>) {
        super();

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
        this._title = args.title ? args.title : "";

        if (
            parsed.scheme == "about" &&
            predefinedFavicons[parsed.pathQueryRef]
        ) {
            this.faviconUrl =
                predefinedFavicons[parsed.pathQueryRef];
        }

        this.createProgressListener();

        this.webContents.addEventListener(
            "pagetitlechanged",
            this.onPageTitleChange
        );

        this.webContents.addEventListener(
            "DOMWindowClose",
            this.onRequestTabClose
        );

        return this;
    }

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
        }

        this.webContents.reloadWithFlags(flags);
        this.updateNavigationState();
    }

    public stop() {
        this.webContents.stop();
        this.updateNavigationState();
    }

    public destroy() {
        const tabIndex = dot.tabs.list.findIndex(
            (tab) => tab.id == this.id
        );

        this.emit("TabClose");

        store.dispatch({
            type: "TAB_UPDATE",
            payload: {
                id: this.id,
                isClosing: true
            }
        });

        const filteredList = dot.tabs.list.filter(
            (x) => !x.isClosing
        );

        // close early because there is no need to destroy a browser
        // that will be destroyed on window close
        if (filteredList.length == 0)
            return window.close();

        const tabsIndex = dot.tabs.list.findIndex(
            (x) => x.id == this.id
        );
        let browserContainer =
            dot.tabs.getBrowserContainer(
                this.webContents
            ).parentNode;

        store.dispatch({
            type: "TAB_KILL",
            payload: this.id
        });

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

        store.dispatch({
            type: "TAB_SELECT",
            payload: dot.tabs.list[newIndex].id
        });

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
        let { browserId } = event.originalTarget;
        let tab = dot.tabs.get(browserId);

        if (!tab) return;

        // Ignore empty title changes on internal pages. This prevents the title
        // from changing while Fluent is populating the (initially-empty) title
        // element.
        if (
            !tab.webContents.contentTitle &&
            tab.webContents.contentPrincipal
                .isSystemPrincipal
        )
            return;

        tab.title = tab.webContents.contentTitle;
    }

    public onRequestTabClose(event: any) {
        let browser = event.target;

        if (!browser.isRemoteBrowser) {
            if (!event.isTrusted) return;

            browser =
                event.target.docShell.chromeEventHandler;
        }

        let { browserId } = browser;

        if (dot.tabs.list.length == 1)
            return window.close();

        const tab = dot.tabs.get(browserId);
        if (tab) {
            tab.destroy();

            event.preventDefault();
        }
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
