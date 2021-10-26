import { computed, makeObservable, observable } from "mobx";
import { dot } from ".";
import { Tab } from "../models/Tab";
import { AppConstants, Ci, Services, ShortcutUtils } from "../modules";
import { TabProgressListener } from "../services/progress";
import { RTL_UI } from "../utils/browser";

export class TabsAPI {
    @observable
    public list: Tab[] = [];

    public get selectedTabId() {
        return dot.browsersPrivate.selectedId;
    }

    public get tabContainer() {
        return document.getElementById("tabbrowser-tabs");
    }

    public tabFilters = new Map();
    public tabListeners = new Map();

    public systemEventBindings = {
        "keydown": this.onBrowserKeyDown,
        "keypress": this.onBrowserKeyPress,
    }

    public eventBindings = {
        "framefocusrequested": this.onRequestTabFocus,
        "sizemodechange": this.onOcclusionChange,
        "occlusionstatechange": this.onOcclusionChange
    }

    @computed
    public get selectedTab() {
        return this.get(dot.browsersPrivate.selectedId);
    }

    public create(data: Partial<Tab>) {
        const tab = new Tab(data);
        this.list.push(tab);

        return tab;
    }

    public get(id: number) {
        return this.list.find(x => x.id == id);
    }

    public getTabById = this.get;

    public getBrowserContainer(browserEl: any) {
        /*
            .browserContainer - up another (second parentElement)
                .browserStack - up one (first parentElement)
                    <browser> - we are here
        */
        const supposedContainer =
            browserEl.parentElement.parentElement;

        if (
            supposedContainer.classList.contains(
                "browserContainer"
            )
        ) {
            return supposedContainer;
        } else {
            return null;
        }
    }

    public get tabsElement() {
        return document.getElementById("tabbrowser-tabs");
    }

    public getPanel(browserEl: any) {
        const supposedContainer =
            this.getBrowserContainer(browserEl);

        if (supposedContainer) {
            const panel = supposedContainer.parentElement;

            if (
                panel.classList.contains(
                    "browserSidebarContainer"
                )
            ) {
                return panel;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public requestReplyFromFrame(event: any) {
        if (event.defaultPrevented) return false;
        if (event.isWaitingReplyFromRemoteContent) return true;
        
        if (
            !event.isReplyEventFromRemoteContent &&
            event.target?.isRemoteBrowser === true
        ) {
            event.requestReplyFromRemoteContent();
            return true;
        }
        
        return false;
    }

    public toggleCaretBrowsing() {
        const kPrefShortcutEnabled =
            "accessibility.browsewithcaret_shortcut.enabled";
        const kPrefWarnOnEnable = "accessibility.warn_on_browsewithcaret";
        const kPrefCaretBrowsingOn = "accessibility.browsewithcaret";

        const caretBrowsingEnabled = dot.prefs.get(kPrefShortcutEnabled);

        if(!caretBrowsingEnabled) return;

        const canBrowseWithCaret = dot.prefs.get(
            kPrefCaretBrowsingOn,
            false
        );

        const shouldWarnOnEnable = dot.prefs.get(
            kPrefWarnOnEnable, 
            true
        );

        if (
            shouldWarnOnEnable && 
            !canBrowseWithCaret
        ) {
            dot.prompt.alert(
                "window",
                "Caret Browsing",
                "Pressing F7 turns Caret Browsing on or off. This feature places a moveable cursor in web pages, allowing you to select text with the keyboard. Do you want to turn Caret Browsing on?",
                "Enable",
                "Disable"
            ).then((result) => {
                dot.prefs.set(
                    kPrefCaretBrowsingOn, 
                    result
                );
            })
        }
    }

    public shouldActivateDocShell(browser: any) {
        return (
            browser.browserId == this.selectedTabId &&
            window.windowState !== window.STATE_MINIMIZED &&
            !window.isFullyOccluded
        );
    }

    public onBrowserKeyDown(event: any) {
        if (
            !event.isTrusted || 
            event.defaultCancelled
        ) return;

        switch (ShortcutUtils.getSystemActionForEvent(event)) {
            case ShortcutUtils.TOGGLE_CARET_BROWSING:
                this.requestReplyFromFrame(event);
                return;
            case ShortcutUtils.MOVE_TAB_FORWARD:
            case ShortcutUtils.MOVE_TAB_BACKWARD:
                // todo: add movement of tabs using keys
                event.preventDefault();
                return;
            case ShortcutUtils.CLOSE_TAB:
                if (!this.selectedTab?.pinned) this.selectedTab?.destroy();
                
                event.preventDefault();
        }
    }

    public onBrowserKeyPress(event: any) {
        if (
            !event.isTrusted || 
            event.defaultCancelled
        ) return;
    
        switch (ShortcutUtils.getSystemActionForEvent(event, { rtl: RTL_UI })) {
            case ShortcutUtils.TOGGLE_CARET_BROWSING:
                this.toggleCaretBrowsing();
                break;
            case ShortcutUtils.NEXT_TAB:
                if (AppConstants.platform == "macosx") {
                    // todo: add movement of tabs using keys
                    event.preventDefault();
                }
              break;
            case ShortcutUtils.PREVIOUS_TAB:
                if (AppConstants.platform == "macosx") {
                    // todo: add movement of tabs using keys
                    event.preventDefault();
                }
              break;
          }
    }

    public onRequestTabFocus(event: any) {
        const browser = event.target;
        const tab = this.get(browser.browserId);

        if (
            !tab || 
            tab.id == this.selectedTab?.id
        ) return;

        tab.select();
        window.focus();
        
        event.preventDefault();
    }

    public onOcclusionChange(event: any) {
        if (event.target == window) {
            const selectedBrowser = this.selectedTab?.webContents;

            selectedBrowser.preserveLayers(
                window.windowState == window.STATE_MINIMIZED ||
                window.isFullyOccluded
            );
            
            selectedBrowser.docShellIsActive = this.shouldActivateDocShell(
                selectedBrowser
            );
        }
    }

    public bindEvents() {
        for(const [event, handler] of Object.entries(this.systemEventBindings)) {
            Services.els.addSystemEventListener(
                document, 
                event, 
                handler.bind(this), 
                false
            );
        }

        for(const [event, handler] of Object.entries(this.eventBindings)) {
            window.addEventListener(
                event,
                handler.bind(this)
            )
        }
    }

    public constructor() {
        makeObservable(this);

        this.bindEvents();

        addEventListener(
            "WillChangeBrowserRemoteness",
            (event: any) => {
                let { browserId } = event.originalTarget;
                let tab: Tab | undefined =
                    this.get(browserId);
                if (!tab) {
                    return;
                }

                tab.emit("remote-changed");

                // Unhook our progress listener.
                let filter =
                    this.tabFilters.get(browserId);
                let oldListener =
                    this.tabListeners.get(browserId);

                tab.webContents.webProgress.removeProgressListener(
                    filter
                );
                filter.removeProgressListener(
                    oldListener
                );

                // We'll be creating a new listener, so destroy the old one.
                oldListener = null;

                tab.webContents.addEventListener(
                    "DidChangeBrowserRemoteness",
                    (event: any) => {
                        const progressListener =
                            new TabProgressListener(
                                browserId
                            );

                        this.tabListeners.set(
                            browserId,
                            progressListener
                        );
                        filter.addProgressListener(
                            progressListener,
                            Ci.nsIWebProgress.NOTIFY_ALL
                        );

                        tab?.webContents.webProgress.addProgressListener(
                            filter,
                            Ci.nsIWebProgress.NOTIFY_ALL
                        );

                        if (
                            tab?.webContents
                                .isRemoteBrowser
                        ) {
                            // todo: add crashed prop to tab
                        }

                        event =
                            document.createEvent(
                                "Events"
                            );
                        event.initEvent(
                            "TabRemotenessChange",
                            true,
                            false
                        );
                        tab?.webContents.dispatchEvent(
                            event
                        );
                    },
                    { once: true }
                );
            }
        );
    }
}
