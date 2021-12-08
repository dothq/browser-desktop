import EventEmitter from "events";
import {
    action,
    computed, makeObservable, observable
} from "mobx";
import { dot } from "../api";
import { ipc } from "../core/ipc";
import { ThumbnailManager } from "../core/thumbnails";
import {
    Cc,
    ChromeUtils,
    Ci,
    ContentCrashHandlers,
    E10SUtils,
    Services,
    SitePermissions
} from "../modules";
import IdentityManager from "../services/identity";
import { TabProgressListener } from "../services/progress";
import { zoomManager } from "../services/zoom";
import { openMenuAt } from "../shared/menu";
import { TAB_MAX_WIDTH, TAB_PINNED_WIDTH } from "../shared/tab";
import { isBlankPageURL } from "../shared/url";
import { MozURI } from "../types/uri";
import { animate } from "../utils/animation";
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

    public get index() {
        return dot.tabs.list.findIndex(tab => tab.id == this.id);
    }

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

    @observable
    public originalUrl: MozURI;

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

    public get host() {
        let host = undefined;

        try {
            host = this.urlParsed.host;
        } catch (e) {}

        return host;
    }

    public get active() {
        return dot.browsersPrivate.selectedId == this.id;
    }

    public get tooltip() {
        const label = [this.title];

        const developerDetailsEnabled = dot.prefs.get(
            "browser.tabs.tooltipsShowPidAndActiveness",
            false
        );

        if (developerDetailsEnabled) {
            const [contentPid, ...framePids] =
                E10SUtils.getBrowserPids(
                    this.webContents,
                    gFissionBrowser
                );

            if (contentPid)
                label[0] = `${label[0]} (pid ${contentPid})`;

            if (gFissionBrowser) {
                label[0] = `${label[0]} [F`;

                if (framePids.length)
                    label[0] = `${
                        label[0]
                    } ${framePids.join(", ")}`;

                label[0] = `${label[0]}]`;
            }

            if (this.active) {
                label[0] = `${label[0]} [A]`;
            }
        }

        label.push(this.urlParsed.spec.split(/[?#]/)[0]);

        return label.join("\n");
    }

    @observable
    public hovering: boolean = false;

    @observable
    public mouseDown: boolean = false;

    @observable
    public lastDragX: number = 0;

    @observable
    private _x: number = 0;

    public get x() {
        return this._x;
    }

    public set x(value: number) {
        this.animate("x", value);
        this._x = value;

        const x = dot.tabs.list
                .map(tab => tab.width)
                .reduce((a, b) => a + b);

        console.log(x)

        animate(
            dot.tabs.newTabButton,
            { translateX: x }
        )
    }

    @observable
    private _width: number = 0;

    public get width() {
        return this._width;
    }

    public set width(value: number) {
        this.animate("width", `${value}px`);
        this._width = value;

        ipc.fire("tabs-bounds-update");
    }
    
    @observable
    public canGoBack: boolean = false;

    @observable
    public canGoForward: boolean = false;

    @observable
    public audioPlaying: boolean = false;

    @observable
    public audioPlaybackBlocked: boolean = false;

    @observable
    public muted: boolean = false;

    public audioPlayingRemovalInt: any;

    @observable
    public pinned: boolean = false;

    @observable
    public bookmarked: boolean = false;

    public bookmark() {
        console.log("stub - bookmark");
    }

    public unBookmark() {
        console.log("stub - unbookmark");
    }

    @action
    public pin() {
        this.pinned = !this.pinned;
        this.width = this.pinned ? TAB_PINNED_WIDTH : TAB_MAX_WIDTH;
    }

    @action
    public updatePosition(index: number) {
 
    }

    @observable
    public urlbarValue?: string;

    public updateNavigationState() {
        this.canGoBack = this.webContents.canGoBack;
        this.canGoForward = this.webContents.canGoForward;
    }

    public toggleDevTools(target: any) {
        return DevToolsShim.inspectNode(this, target);
    }

    @observable
    public title?: string;

    public updateTitle() {
        const browser = this.webContents;

        let { currentURI, contentTitle } = browser;

        const isContentTitle = !!contentTitle;
        if (!contentTitle) {
            if (currentURI.displaySpec) {
                try {
                    contentTitle =
                        Services.io.createExposableURI(
                            browser.currentURI
                        ).displaySpec;
                } catch (ex) {
                    contentTitle =
                        browser.currentURI.displaySpec;
                }
            }

            if (
                contentTitle &&
                !isBlankPageURL(contentTitle)
            ) {
                if (
                    contentTitle.length > 500 &&
                    contentTitle.match(
                        /^data:[^,]+;base64,/
                    )
                ) {
                    contentTitle = `${contentTitle.substring(
                        0,
                        500
                    )}\u2026`;
                } else {
                    // Try to unescape not-ASCII URIs using the current character set.
                    try {
                        const { characterSet } = browser;

                        contentTitle =
                            Services.textToSubURI.unEscapeNonAsciiURI(
                                characterSet,
                                contentTitle
                            );
                    } catch (e) {}
                }
            } else {
                contentTitle = "New Tab";
            }
        }

        if (!isContentTitle) {
            contentTitle = contentTitle.replace(
                /^[^:]+:\/\/(?:www\.)?/,
                ""
            );
        }

        this.title = contentTitle;

        dot.window.updateWindowTitle();

        return contentTitle;
    }

    public animate(
        key: string, 
        value: any, 
        options?: { 
            easeFunction?: string, 
            duration?: number 
        }
    ) {
        if(!this.linkedTab) return;

        return animate(
            this.linkedTab,
            {
                [key]: value,
                ease: options?.easeFunction 
                    ? options.easeFunction
                    : "power4.out",
                duration: options?.duration
                    ? options.duration
                    : 0.2
            }
        )
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

    public get thumbnails() {
        return new ThumbnailManager(this);
    }

    @observable
    public initialIconHidden: boolean = false;

    @observable
    public faviconUrl: any;
    public faviconLoadingPrincipal: any;

    @observable
    public shouldHideIcon: boolean = true;

    @observable
    public pendingIcon: boolean = false;

    public setIcon(
        iconURL: string,
        originalURL = iconURL,
        loadingPrincipal?: any
    ) {
        const makeString = (url: any) =>
            url instanceof Ci.nsIURI ? url.spec : url;

        iconURL = makeString(iconURL);
        originalURL = makeString(originalURL);

        const LOCAL_PROTOCOLS = [
            "chrome:",
            "about:",
            "resource:",
            "data:"
        ];

        if (
            iconURL &&
            !loadingPrincipal &&
            !LOCAL_PROTOCOLS.some((protocol) =>
                iconURL.startsWith(protocol)
            )
        ) {
            console.error(
                `Attempt to set a remote URL ${iconURL} as a tab icon without a loading principal.`
            );
            return;
        }

        this.webContents.mIconURL = iconURL;
        this.faviconLoadingPrincipal = loadingPrincipal;
        this.faviconUrl = iconURL;
        this.shouldHideIcon = false;
        this.pendingIcon = false;
    }

    public clearPendingIcon() {
        this.shouldHideIcon = true;
        this.pendingIcon = false;
    }

    @observable
    public isClosing: boolean = false;

    @observable
    public contentState: any;

    @computed
    public get identityManager() {
        return observable(new IdentityManager(this));
    }

    public onTabMouseOver() {
        this.hovering = true;
    }

    public onTabMouseLeave() {
        this.hovering = false;
    }

    public onTabMouseDown(
        e: MouseEvent
    ) {
        e.preventDefault();
        e.stopPropagation();

        switch (e.button) {
            // Left click
            case 0:
                this.select();
                this.mouseDown = true;

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

    public onTabMouseUp(e: MouseEvent) {
        this.mouseDown = false;
        this.x = 0;
    }

    public onTabMouseMove(e: MouseEvent) {
        if(
            !this.mouseDown ||
            !this.linkedTab
        ) return;

        const direction = this.lastDragX < e.pageX ? "right" : "left"

        this.lastDragX = new WebKitCSSMatrix(this.linkedTab.style.transform).m41;

        if(direction == "right") {
            this.linkedTab.style.transform = `translateX(${this.lastDragX++}px)`;
        } else {
            this.linkedTab.style.transform = `translateX(${this.lastDragX--}px)`;
        }
    }

    public webContents: any;

    // this is here for compatibility with devtools
    public get linkedBrowser() {
        return this.webContents;
    }

    public get linkedTab() {
        return document.getElementById(
            `tab-${this.id}`
        ) as HTMLDivElement | undefined;
    }

    public tagName = "tab";

    public eventBindings = {
        pagetitlechanged: this.onPageTitleChange,

        "oop-browser-crashed": this.onTabCrashed,
        "oop-browser-buildid-mismatch": this.onTabCrashed,

        DOMWindowClose: this.onRequestTabClose,

        DOMAudioPlaybackStarted:
            this.onAudioPlaybackStarted,
        DOMAudioPlaybackStopped:
            this.onAudioPlaybackStopped,
        DOMAudioPlaybackBlockStarted:
            this.onAudioPlaybackBlockStarted,
        DOMAudioPlaybackBlockStopped:
            this.onAudioPlaybackBlockStopped,

        GloballyAutoplayBlocked:
            this.onAudioPlaybackGloballyBlocked
    };

    public internalEventBindings = {
        "search-engine-available":
            this.onSearchEngineAvailable
    };

    public constructor(args: Partial<Tab>) {
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

        this.originalUrl = parsed;

        this.webContents = browser;
        this.id = this.webContents.browserId;
        this.background = !!args.background;
        this.initialIconHidden = !!args.initialIconHidden;

        this.bindEvents();

        if (args.title) {
            this.title = args.title;
        } else {
            this.updateTitle();
        }

        this.createProgressListener();

        ipc.fire("tab-created", this.id);

        return this;
    }

    public postCreationHook() {
        this.x = TAB_MAX_WIDTH * this.index;
        this.width = 250;
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

    public destroy(
        options?: { noAnimate?: boolean } & object
    ) {
        const tabIndex = dot.tabs.list.findIndex(
            (tab) => tab.id == this.id
        );

        this.emit("TabClose");

        this.isClosing = true;
        this.width = 0;

        let animationDuration = 0;

        if (!options?.noAnimate) {
            const rawDuration = getComputedStyle(
                dot.tabs.tabsElement as Element
            ).getPropertyValue(
                "--tab-animation-duration"
            );

            if (
                rawDuration.endsWith("s") &&
                !rawDuration.endsWith("ms")
            ) {
                // We know the value is using the "seconds" unit.
                // We just need to convert it to ms for setTimeout.
                const extractedNumber =
                    parseFloat(rawDuration);

                // Convert it to ms
                animationDuration =
                    extractedNumber * 1000;
            } else if (rawDuration.endsWith("ms")) {
                animationDuration =
                    parseFloat(rawDuration);
            }
        }

        setTimeout(() => {
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
        }, animationDuration / 2);

        setTimeout(() => {
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
        }, animationDuration);
    }

    public select() {
        ipc.fire("tab-change", { id: this.id });

        dot.browsersPrivate.select(this.id);
    }

    public toggleMute() {
        if (this.audioPlaybackBlocked) {
            this.audioPlaybackBlocked = false;

            this.webContents.resumeMedia();
        } else {
            if (this.webContents.audioMuted) {
                this.webContents.unmute();
            } else {
                this.webContents.mute();
            }

            this.muted = this.webContents.audioMuted;
        }
    }

    public emit(
        event: string | symbol,
        ...args: any[]
    ): boolean {
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
        if (!event.isTrusted) return;

        const browser = event.originalTarget;
        const tab = dot.tabs.get(browser.browserId);

        if (!tab) return;

        // Ignore empty title changes on internal pages. This prevents the title
        // from changing while Fluent is populating the (initially-empty) title
        // element.
        if (
            !browser.contentTitle &&
            browser.contentPrincipal.isSystemPrincipal
        )
            return;

        tab.updateTitle();
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

    public onTabCrashed(event: any) {
        if (!event.isTrusted) return;

        const browser = event.originalTarget;

        if (!event.isTopFrame) {
            return ContentCrashHandlers.onSubFrameCrash(
                browser,
                event.childID
            );
        }

        const isRestartRequiredCrash =
            event.type == "oop-browser-buildid-mismatch";

        if (dot.tabs.selectedTabId == browser.browserId) {
            ContentCrashHandlers.onSelectedBrowserCrash(
                browser,
                isRestartRequiredCrash
            );
        } else {
            ContentCrashHandlers.onBackgroundBrowserCrash(
                browser,
                isRestartRequiredCrash
            );
        }

        this.audioPlaying = false;

        this.setIcon(browser.mIconURL, browser.mIconURL);
    }

    public onAudioPlaybackStarted(event: any) {
        const browser = event.originalTarget;
        const tab = dot.tabs.get(browser.browserId);

        if (!tab) return;

        clearTimeout(tab.audioPlayingRemovalInt);
        tab.audioPlayingRemovalInt = null;

        tab.audioPlaying = false;
        tab.audioPlaying = true;
    }

    public onAudioPlaybackStopped(event: any) {
        const browser = event.originalTarget;
        const tab = dot.tabs.get(browser.browserId);

        if (!tab) return;

        if (tab.audioPlaying && !tab.muted) {
            const removalDelay = dot.prefs.get(
                "browser.tabs.delayHidingAudioPlayingIconMS",
                3000
            );

            tab.audioPlayingRemovalInt = setTimeout(
                () => {
                    tab.audioPlaying = false;
                },
                removalDelay
            );
        }
    }

    public onAudioPlaybackBlockStarted(event: any) {
        const browser = event.originalTarget;
        const tab = dot.tabs.get(browser.browserId);

        if (!tab) return;

        tab.audioPlaybackBlocked = true;
    }

    public onAudioPlaybackBlockStopped(event: any) {
        const browser = event.originalTarget;
        const tab = dot.tabs.get(browser.browserId);

        if (!tab) return;

        tab.audioPlaybackBlocked = false;
    }

    public onAudioPlaybackGloballyBlocked(event: any) {
        const browser = event.originalTarget;
        const tab = dot.tabs.get(browser.browserId);

        if (!tab) return;

        SitePermissions.setForPrincipal(
            browser.contentPrincipal,
            "autoplay-media",
            SitePermissions.BLOCK,
            SitePermissions.SCOPE_GLOBAL,
            browser
        );
    }

    public onSearchEngineAvailable(data: any) {
        console.log(
            "todo: OpenSearch engine available",
            data
        );
    }

    public bindEvents() {
        for (const [event, handler] of Object.entries(
            this.eventBindings
        )) {
            this.webContents.addEventListener(
                event,
                handler.bind(this)
            );
        }

        for (const [event, handler] of Object.entries(
            this.internalEventBindings
        )) {
            this.on(event, handler.bind(this));
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