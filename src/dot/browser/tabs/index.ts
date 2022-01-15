/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Tab from "browser/tab";
import TabProgressListener from "browser/tab/progress";
import { TabUtils } from "browser/tab/utils";
import { Platform } from "browser/utilities";
import { Browser } from "index";
import { Cc, Ci, Cu, E10SUtils, Services } from "mozilla";
import { appendChild, attr, div, getDOMNode, OikiaElement } from "oikia";
import { MozURI } from "types/uri";

class BrowserTabs {
    public tabBrowsers: Map<HTMLBrowserElement, Tab> = new Map();
    public tabListeners: Map<Tab, any> = new Map();
    public tabFilters: Map<Tab, any> = new Map();
    public lastRelatedTabs: WeakMap<Tab, Tab> = new WeakMap();

    public progressListeners: string[] = [];
    public tabsProgressListeners: string[] = [];

    public uniquePanelCount: number = 0;

    public tabs: Tab[] = [];

    public selectedTab: Tab | undefined;

    public get selectedBrowser() {
        return this.selectedTab?.linkedBrowser;
    }

    public get numPinnedTabs() {
        for (var i = 0; i < this.tabs.length; i++) {
            if (!this.tabs[i].pinned) {
                break;
            }
        }
        
        return i;
    }

    public localProtocols = [
        "chrome:", 
        "about:", 
        "resource:", 
        "data:"
    ]

    public get arrowKeysShouldWrap() {
        return this.browser.utilities.platform == Platform.macOS;
    }

    public createBrowser(options: Partial<{
        isPreloadBrowser: boolean;
        name: string;
        openWindowInfo: any;
        remoteType: string;
        initialBrowsingContextGroupId: any;
        uriIsAboutBlank: boolean;
        userContextId: any;
        skipLoad: boolean;
        initiallyActive: boolean;
    }>) {
        const browser = document.createXULElement(
            "browser"
        ) as OikiaElement as HTMLBrowserElement;
    
        browser.permanentKey = new (Cu.getGlobalForObject(Services).Object)();
    
        const defaultAttributes: Record<any, any> = {
            contextmenu: "contentAreaContextMenu",
            maychangeremoteness: true,
            message: true,
            messagemanagergroup: "browsers",
            selectmenulist: "ContentSelectDropdown",
            tooltip: "aHTMLTooltip",
            type: "content"
        };
    
        if (!options.initiallyActive) {
            defaultAttributes.initiallyactive = false;
        }
    
        if (options.userContextId) {
            defaultAttributes.usercontextid = options.userContextId;
        }
    
        if (options.remoteType) {
            defaultAttributes.remoteType = options.remoteType;
            defaultAttributes.remote = true;
        }
    
        if (!options.isPreloadBrowser) {
            defaultAttributes.autocompletepopup =
                "PopupAutoComplete";
        } else {
            defaultAttributes.preloadedState = "preloaded";
        }
    
        if (options.initialBrowsingContextGroupId) {
            defaultAttributes.initialBrowsingContextGroupId =
            options.initialBrowsingContextGroupId;
        }
    
        if (options.openWindowInfo) {
            browser.openWindowInfo = options.openWindowInfo;
        }
    
        if (options.name) {
            defaultAttributes.name = options.name;
        }
    
        if (!options.uriIsAboutBlank || options.skipLoad) {
            defaultAttributes.nodefaultsrc = true;
        }
    
        for (const [key, value] of Object.entries(
            defaultAttributes
        )) {
            attr(browser, key, value.toString());
        }
    
        const BrowserContainer = div({
            class: "browserview"
        });
        // We are unable to create XUL elements using Oikia yet
        // Instead we just append the browser to the browser container.
        BrowserContainer.appendChild(browser);
    
        return browser;
    }

    public insertBrowser(
        tab: Tab,
        insertedOnTabCreation?: boolean
    ) {
        const {
            linkedBrowser,
            linkedPanel
        } = tab;

        if (
            !linkedBrowser ||
            linkedPanel ||
            window.closed ||
            !tab.browserParams
        ) return;

        const { uriIsAboutBlank } = tab.browserParams;
        delete tab.browserParams;

        const container = this.getBrowserContainer(linkedBrowser);
        const id = this.generateUniquePanelID();
        
        container.id = id;
        tab.linkedPanel = container;

        // Append the container to the tabbox
        if (!container.parentNode) {
            appendChild(
                getDOMNode("#browser-content-tabbox"),
                container
            )
        }

        this.registerProgressListener(
            tab,
            linkedBrowser,
            uriIsAboutBlank
        );

        linkedBrowser.droppedLinkHandler = TabUtils.droppedLinkHandler;
        linkedBrowser.loadURI = TabUtils.loadURIHandler
            .bind(null, linkedBrowser);

        // if (this.tabs.length == 2) {
        //     this.tabs[0].linkedBrowser?.sendMessageToActor(
        //         "Browser:HasSiblings",
        //         true,
        //         "BrowserTab"
        //     );
        //     this.tabs[1].linkedBrowser?.sendMessageToActor(
        //         "Browser:HasSiblings",
        //         true,
        //         "BrowserTab"
        //     );
        // } else {
        //     tab.linkedBrowser?.sendMessageToActor(
        //         "Browser:HasSiblings",
        //         this.tabs.length > 1,
        //         "BrowserTab"
        //     );
        // }
    }

    public addTab(
        uri: string,
        options: {
            allowInheritPrincipal?: boolean,
            allowThirdPartyFixup?: boolean,
            bulkOrderedOpen?: boolean,
            charset?: string,
            disableTRR?: boolean,
            eventDetail?: any,
            focusUrlBar?: boolean,
            forceNotRemote?: boolean,
            fromExternal?: boolean,
            index?: number,
            lazyTabTitle?: string,
            name?: string,
            noInitialLabel?: boolean,
            openWindowInfo?: any,
            openerBrowser?: any,
            originPrincipal?: any,
            originStoragePrincipal?: any,
            ownerTab?: any,
            pinned?: boolean,
            postData?: any,
            preferredRemoteType?: any,
            referrerInfo?: any,
            relatedToCurrent?: boolean,
            initialBrowsingContextGroupId?: any,
            skipAnimation?: boolean,
            skipBackgroundNotify?: boolean,
            triggeringPrincipal: any,
            userContextId?: any,
            csp?: any,
            skipLoad?: boolean,
            batchInsertingTabs?: boolean
        }
    ) {
        if (!options?.triggeringPrincipal) {
            throw new Error(
                "Required argument triggeringPrincipal missing within addTab"
            );
        }
      
        // Remove the owner of the selected tab
        if (this.selectedTab && this.selectedTab?.owner) {
            this.selectedTab.owner = undefined;
        }
      
        // Locate the tab that opened this tab
        if (options.relatedToCurrent == null) {
            options.relatedToCurrent = !!(
                options.referrerInfo && 
                options.referrerInfo.originalReferrer
            );
        }

        const openerTab: Tab = (
            (options.openerBrowser && this.getTabForBrowser(options.openerBrowser)) ||
            (options.relatedToCurrent && this.selectedTab)
        )
      
        uri = uri || "about:blank";
        let parsed;

        const isAboutBlank = uri == "about:blank";

        try {
            parsed = Services.io.newURI(uri);
        } catch (e) {}

        // Check if we are allowed to show tab animation
        const canAnimate = (
            !options.skipAnimation &&
            !options.pinned &&
            !this.browser.motion.useReducedMotion
        )
      
        // Inherit the opener's context id if we don't have one
        if (options.userContextId == null && openerTab) {
            options.userContextId = openerTab.userContextId || 0;
        }

        const { pinned, userContextId } = options;

        const tab = new Tab({
            openerTab,
            userContextId,
            pinned,
            canAnimate
        });
      
        if (!options.noInitialLabel) {
            if (this.browser.utilities.isBlankPageURL(uri)) {
                tab.title = TabUtils.emptyTabTitle;
            } else {
                tab.title = uri;
            }
        }

        let browser;
      
        try {
            if (!options.batchInsertingTabs) {
                const {
                    index,
                    ownerTab,
                    bulkOrderedOpen
                } = options;

                this.insertTabAtIndex(tab, {
                    index,
                    ownerTab,
                    openerTab,
                    pinned,
                    bulkOrderedOpen,
                });
            }

            // If we don't have a preferred remote type, inherit one from
            // the openerBrowser.
            if (!options.preferredRemoteType && options.openerBrowser) {
                options.preferredRemoteType = options.openerBrowser.remoteType;
            }
    
            const originAttributes = E10SUtils.predictOriginAttributes({ 
                window, 
                userContextId 
            });
    
            // If the URL is about:blank we need to use the referrer
            // to build a remote type for the new tab.
            if (
                isAboutBlank &&
                !options.preferredRemoteType &&
                options.referrerInfo &&
                options.referrerInfo.originalReferrer
            ) {
                options.preferredRemoteType = E10SUtils.getRemoteTypeForURI(
                    options.referrerInfo.originalReferrer.spec,
                    this.browser.isMultiProcess,
                    this.browser.isFission,
                    E10SUtils.DEFAULT_REMOTE_TYPE,
                    null,
                    originAttributes
                );
            }
    
            const remoteType = options.forceNotRemote
                ? E10SUtils.NOT_REMOTE
                : E10SUtils.getRemoteTypeForURI(
                    uri,
                    this.browser.isMultiProcess,
                    this.browser.isFission,
                    options.preferredRemoteType,
                    null,
                    originAttributes
                );

            const {
                initialBrowsingContextGroupId,
                openWindowInfo,
                name,
                skipLoad
            } = options;
    
            browser = this.createBrowser({
                remoteType,
                uriIsAboutBlank: isAboutBlank,
                userContextId,
                initialBrowsingContextGroupId,
                openWindowInfo,
                name,
                skipLoad,
            });
    
            tab.linkedBrowser = browser as HTMLBrowserElement;
    
            if (options.focusUrlBar) {
                console.log("todo")
            }
    
            this.tabBrowsers.set(
                browser as HTMLBrowserElement, 
                tab
            );

            tab.permanentKey = tab.linkedBrowser.permanentKey;
            tab.browserParams = {
                uriIsAboutBlank: isAboutBlank,
                remoteType
            }

            this.insertBrowser(tab, true);
        } catch (e) {
            Cu.reportError("Failed to create tab");
            Cu.reportError(e);

            throw e;
        }
      
        this.setDefaultIcon(tab, parsed);
      
        if (!options.batchInsertingTabs) {
            if (
                options.originPrincipal &&
                options.originStoragePrincipal &&
                uri
            ) {
                const { 
                    URI_INHERITS_SECURITY_CONTEXT 
                } = Ci.nsIProtocolHandler;

                const protocolInheritsSecContext = (
                    this.browser.utilities.doGetProtocolFlags(parsed) & URI_INHERITS_SECURITY_CONTEXT
                );

                if (
                    !parsed ||
                    protocolInheritsSecContext
                ) {
                    browser.createAboutBlankContentViewer(
                        options.originPrincipal,
                        options.originStoragePrincipal
                    );
                }
            }
    
            if (
                (
                    !isAboutBlank || 
                    !options.allowInheritPrincipal
                ) &&
                !options.skipLoad
            ) {
                const { 
                    LOAD_FLAGS_NONE,
                    LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP,
                    LOAD_FLAGS_FIXUP_SCHEME_TYPOS,
                    LOAD_FLAGS_FROM_EXTERNAL,
                    LOAD_FLAGS_FIRST_LOAD,
                    LOAD_FLAGS_DISALLOW_INHERIT_PRINCIPAL,
                    LOAD_FLAGS_DISABLE_TRR
                } = Ci.nsIWebNavigation;

                let flags = LOAD_FLAGS_NONE;

                if (options.allowThirdPartyFixup) {
                    flags |= LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP;
                    flags |= LOAD_FLAGS_FIXUP_SCHEME_TYPOS;
                }

                if (options.fromExternal) {
                    flags |= LOAD_FLAGS_FROM_EXTERNAL;
                } else if (!options.triggeringPrincipal.isSystemPrincipal) {
                    flags |= LOAD_FLAGS_FIRST_LOAD;
                }

                if (!options.allowInheritPrincipal) {
                    flags |= LOAD_FLAGS_DISALLOW_INHERIT_PRINCIPAL;
                }

                if (options.disableTRR) {
                    flags |= LOAD_FLAGS_DISABLE_TRR;
                }

                try {
                    const {
                        triggeringPrincipal,
                        referrerInfo,
                        charset,
                        postData,
                        csp
                    } = options;

                    browser.loadURI(uri, {
                        flags,
                        triggeringPrincipal,
                        referrerInfo,
                        charset,
                        postData,
                        csp,
                    });
                } catch (e) {
                    Cu.reportError(e);
                }
            }
        }
      
        return tab;
    }

    public insertTabAtIndex(
        tab: Tab,
        options: {
            index?: number,
            ownerTab?: Tab,
            openerTab?: Tab,
            pinned?: boolean,
            bulkOrderedOpen?: boolean
        }
    ) {
        if (options.ownerTab) {
            tab.owner = options.ownerTab;
        }
      
        if (typeof options.index != "number") {
            // Move the new tab after another tab if needed.
            if (
                !options.bulkOrderedOpen &&
                (
                    (
                        options.openerTab &&
                        this.browser.preferences.get(
                            "browser.tabs.insertRelatedAfterCurrent"
                        )
                    ) ||
                    this.browser.preferences.get(
                        "browser.tabs.insertAfterCurrent"
                    )
                )
            ) {
                const lastRelatedTab = (
                    options.openerTab && 
                    this.lastRelatedTabs.get(options.openerTab)
                );

                const previousTab = (
                    lastRelatedTab || 
                    options.openerTab || 
                    this.selectedTab
                );

                if(
                    !lastRelatedTab ||
                    !previousTab
                ) return;

                options.index = previousTab.index + 1;
      
                if (lastRelatedTab) {
                    lastRelatedTab.owner = undefined;
                } else if (options.openerTab) {
                    tab.owner = options.openerTab;
                }

                // Always set related map if opener exists.
                if (options.openerTab) {
                    this.lastRelatedTabs.set(
                        options.openerTab, 
                        tab
                    );
                }
            } else {
                options.index = Infinity;
            }
        }

        // Ensure index is within bounds.
        if (options.pinned) {
            options.index = Math.max(options.index, 0);
            options.index = Math.min(options.index, this.numPinnedTabs);
        } else {
            options.index = Math.max(options.index, this.numPinnedTabs);
            options.index = Math.min(options.index, this.tabs.length);
        }
      
        const tabAfter = this.tabs[options.index] || null;

        if (tabAfter) {
            tab.init((tabAfter as any).linkedTab);

            console.log("_updateTabsAfterInsert")
        } else {
            tab.index = options.index;
        }
    }

    public getBrowserForTab(tab: Tab) {
        return tab.linkedBrowser;
    }

    public getTabForBrowser(browser: HTMLBrowserElement) {
        return this.tabBrowsers.get(browser);
    }

    public getBrowserContainer(browser: HTMLBrowserElement) {
        return browser.parentNode as HTMLDivElement;
    }

    /**
     * Updates the tab's icon
     * @param tab Tab
     * @param iconUrl URL of the icon
     * @param loadingPrincipal Loading principal to load the icon
     */
    public setIcon(
        tab: Tab,
        iconUrl = "",
        loadingPrincipal?: any
      ) {
        let makeString = (url: any) => {
            return (url instanceof Ci.nsIURI 
                ? url.spec 
                : url);
        };
  
        iconUrl = makeString(iconUrl);
  
        if (
            iconUrl &&
            !loadingPrincipal &&
            !this.localProtocols.some(
                protocol => iconUrl.startsWith(protocol)
            )
        ) {
            console.error(`Unable to set tab icon to '${iconUrl}' as a loading principal was expected.`)
            return;
        }
  
        const browser = this.getBrowserForTab(tab);
        
        if(browser) {
            browser.mIconURL = iconUrl;
  
            if (iconUrl !== tab.icon) {
                if (iconUrl) {
                    tab.icon = iconUrl;
                } else {
                    tab.icon = "";
                }
            }
        }
    }
  
    public getIcon(tab?: Tab) {
        const browser = tab 
            ? this.getBrowserForTab(tab) 
            : this.selectedBrowser;

        if(browser) {
            return browser.mIconURL;
        } else {
            return undefined;
        }
    }

    /**
     * Sets the default icon of the tab to improve perceived performance
     * @param tab
     * @param uri
     */
    public setDefaultIcon(tab: Tab, uri: MozURI) {
        if (
            uri && 
            uri.spec in TabUtils.faviconDefaults
        ) {
            this.setIcon(
                tab, 
                TabUtils.faviconDefaults[uri.spec]
            );
        }
    }

    public createInitialTab() {
        let uri: any = this.browser.init.urlArguments;
        
        let openWindowInfo = window.docShell.treeOwner
            .QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIAppWindow).initialOpenWindowInfo;

        if (!openWindowInfo && window.arguments && window.arguments[11]) {
            openWindowInfo = window.arguments[11];
        }

        if (uri && Array.isArray(uri)) {
            uri = uri[0];
        }

        let userContextId: any;
        let remoteType: any;
        let triggeringPrincipal = Services.scriptSecurityManager
            .getSystemPrincipal();

        if (openWindowInfo) {
            userContextId = openWindowInfo.originAttributes.userContextId;
            
            remoteType = openWindowInfo.isRemote
                ? E10SUtils.DEFAULT_REMOTE_TYPE
                : E10SUtils.NOT_REMOTE;
        } else {
            if(uri && typeof uri == "string") {
                const originAttributes = E10SUtils.predictOriginAttributes({
                    window,
                    userContextId,
                });

                remoteType = E10SUtils.getRemoteTypeForURI(
                    uri,
                    this.browser.isMultiProcess,
                    this.browser.isFission,
                    E10SUtils.DEFAULT_REMOTE_TYPE,
                    null,
                    originAttributes
                );
            } else {
                remoteType = E10SUtils.DEFAULT_REMOTE_TYPE;
            }
        }

        this.addTab(
            uri,
            {
                index: 0,
                triggeringPrincipal,
                userContextId,
                preferredRemoteType: remoteType,
                openWindowInfo,
            }
        );
    }

    public selectTabAtIndex(index: number) {
        if (index < 0) {
            index += this.tabs.length;

            if (index < 0) index = 0;
        } else if (index >= this.tabs.length) {
            index = this.tabs.length - 1;
        }
  
        this.selectedTab = this.tabs[index];
    }

    public moveTabTo(tab: Tab, index: number) {
        const position = tab.index;

        if (position == index)
  
        if (tab.pinned) {
            index = Math.min(index, this.numPinnedTabs - 1);
        } else {
            index = Math.max(index, this.numPinnedTabs);
        }

        if (position == index) return;
  
        index = index < tab.index 
            ? index 
            : index + 1;
  
        const neighbor = this.tabs[index];

        const titlebar = getDOMNode("#browser-titlebar");

        titlebar.insertBefore(
            (tab as any).linkedTab, 
            (neighbor as any).linkedTab
        );
    }
  
    public moveTabForward() {
        if(!this.selectedTab) return;

        const nextTab = this.findNextTab(this.selectedTab, {
            direction: 1,
            filter: tab => !tab.hidden,
        });
  
        if (nextTab) {
            this.moveTabTo(this.selectedTab, nextTab.index);
        } else if (this.arrowKeysShouldWrap) {
            this.moveTabToStart();
        }
    }

    public moveTabBackward() {
        if(!this.selectedTab) return;

        const previousTab = this.findNextTab(this.selectedTab, {
            direction: -1,
            filter: tab => !tab.hidden,
        });
  
        if (previousTab) {
            this.moveTabTo(this.selectedTab, previousTab.index);
        } else if (this.arrowKeysShouldWrap) {
            this.moveTabToEnd();
        }
    }
  
    public moveTabToStart() {
        if(!this.selectedTab) return;

        const { index } = this.selectedTab;

        if (index > 0) {
            this.moveTabTo(this.selectedTab, 0);
        }
    }
  
    public moveTabToEnd() {
        if(!this.selectedTab) return;

        const { index } = this.selectedTab;

        if (index < this.tabs.length - 1) {
            this.moveTabTo(this.selectedTab, this.tabs.length - 1);
        }
    }

    public findNextTab(
        tab: Tab, 
        options: { 
            direction: number, 
            wrap?: boolean, 
            startWithAdjacent?: boolean, 
            filter: (tab: Tab) => boolean 
        }
    ) {
        const startTab = tab;

        if (!options.startWithAdjacent && options.filter(tab)) {
            return tab;
        }
  
        let i = this.tabs.indexOf(tab);

        if (i < 0) return null;
  
        while (true) {
            i += options.direction;
            if (options.wrap) {
                if (i < 0) {
                    i = this.tabs.length - 1;
                } else if (i >= this.tabs.length) {
                    i = 0;
                }
            } else if (i < 0 || i >= this.tabs.length) {
                return null;
            }
    
            tab = this.tabs[i];

            if (tab == startTab) return null;
            if (options.filter(tab)) return tab;
        }
    }

    public registerProgressListener(
        tab: Tab,
        browser: HTMLBrowserElement,
        uriIsAboutBlank?: boolean
    ) {
        // Setup a progress listener
        const listener = new TabProgressListener(
            tab,
            browser,
            true
        );

        const filter = Cc[
            "@mozilla.org/appshell/component/browser-status-filter;1"
        ].createInstance(Ci.nsIWebProgress);

        filter.addProgressListener(
            listener, 
            Ci.nsIWebProgress.NOTIFY_ALL
        );

        browser.webProgress.addProgressListener(
            filter,
            Ci.nsIWebProgress.NOTIFY_ALL
        );

        this.tabListeners.set(tab, listener);
        this.tabFilters.set(tab, filter);
    }

    public generateUniquePanelID() {  
        const { outerWindowID } = window.docShell;
  
        return `panel-${outerWindowID}-${++this.uniquePanelCount}`;
    }

    public addProgressListener(listener: any) {
        this.progressListeners.push(listener);
    }
  
    public removeProgressListener(listener: any) {
        this.progressListeners = this.progressListeners.filter(
            (e: any) => e !== listener
        );
    }

    public addTabsProgressListener(listener: any) {
        this.tabsProgressListeners.push(listener);
    }
  
    public removeTabsProgressListener(listener: any) {
        this.tabsProgressListeners = this.tabsProgressListeners.filter(
            (e: any) => e !== listener
        );
    }

    public callProgressListeners(
        browser: HTMLBrowserElement,
        method: string,
        args: any,
        callGlobalListeners = true,
        callTabsListeners = true
    ) {
        let res = true;
      
        const callListeners = (listeners: any[], args: any) => {
            for (let p of listeners) {
                if (method in p) {
                    try {
                        if (!p[method].apply(p, args)) {
                            res = false;
                        }
                    } catch (e) {
                        Cu.reportError(e);
                    }
                }
            }
        }
      
        browser = browser || this.selectedBrowser;
      
        if (
            callGlobalListeners && 
            browser == this.selectedBrowser
        ) {
            callListeners(
                this.progressListeners, 
                args
            );
        }
      
        if (callTabsListeners) {
            args.unshift(browser);
    
            callListeners(
                this.tabsProgressListeners, 
                args
            );
        }
      
        return res;
    }

    public constructor(private browser: Browser) {
        this.uniquePanelCount = 0;
    }
}

export default BrowserTabs;