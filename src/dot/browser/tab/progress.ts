/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dot from "index";
import { ChromeUtils, Ci, Components } from "mozilla";
import { MozURI } from "types/uri";
import Tab from ".";
import { TabUtils } from "./utils";

const {
    STATE_START,
    STATE_STOP,
    STATE_RESTORING,
    STATE_IS_REQUEST,
    STATE_IS_NETWORK,

    LOCATION_CHANGE_SAME_DOCUMENT,
    LOCATION_CHANGE_RELOAD,
    LOCATION_CHANGE_ERROR_PAGE
} = Ci.nsIWebProgressListener

class TabProgressListener {
    public tab?: Tab;
    public browser?: HTMLBrowserElement;
    public blank: boolean;

    public stateFlags: number;
    public status: number;
    public message: string;
    public totalProgress: number;
    public requestCount: number;

    public constructor(
        tab: Tab,
        browser: HTMLBrowserElement,
        startsBlank?: boolean,
        wasPreloadedBrowser?: boolean,
        origStateFlags?: number,
        origRequestCount?: number
    ) {
        let stateFlags = origStateFlags || 0;

        if (wasPreloadedBrowser) {
            stateFlags =
                STATE_STOP |
                STATE_IS_REQUEST;
        }

        this.tab = tab;
        this.browser = browser;
        this.blank = startsBlank || false;

        this.stateFlags = stateFlags;
        this.status = 0;
        this.message = "";
        this.totalProgress = 0;
        this.requestCount = origRequestCount || 0;
    }

    public destroy() {
        delete this.tab;
        delete this.browser;
    }

    public callProgressListeners(
        method: string, 
        args: any, 
        callGlobalListeners?: boolean, 
        callTabsListeners?: boolean
    ) {
        if(!this.browser) return;

        return dot.tabs.callProgressListeners(
            this.browser,
            method,
            args,
            callGlobalListeners,
            callTabsListeners
        );
    }

    public shouldShowProgress(request: any) {
        if (this.blank) return false;

        return !(
            request instanceof Ci.nsIChannel &&
            request.originalURI.schemeIs("about")
        );
    }

    public isForInitialAboutBlank(
        webProgress: any, 
        flags: any, 
        location: MozURI
    ) {
        if (
            !this.blank || 
            !webProgress.isTopLevel
        ) {
            return false;
        }

        if (
            flags & STATE_STOP &&
            this.requestCount == 0 &&
            !location
        ) {
            return true;
        }

        return (location ? location.spec : "") == "about:blank";
    }

    public onProgressChange(
        webProgress: any,
        request: any,
        curSelfProgress: number,
        maxSelfProgress: number,
        curTotalProgress: number,
        maxTotalProgress: number
    ) {
        this.totalProgress = maxTotalProgress
            ? curTotalProgress / maxTotalProgress
            : 0;

        if (!this.shouldShowProgress(request)) {
            return;
        }

        if (
            this.totalProgress && 
            this.tab?.busy
        ) {
            this.tab.progress = true;
        }

        this.callProgressListeners("onProgressChange", [
            webProgress,
            request,
            curSelfProgress,
            maxSelfProgress,
            curTotalProgress,
            maxTotalProgress,
        ]);
    }

    public onProgressChange64 = this.onProgressChange;

    public onStateChange(
        webProgress: any, 
        request: any, 
        flags: number, 
        status: any
    ) {
        if (
            !this.browser ||
            !this.tab ||
            !request
        ) return;

        let location;
        let originalLocation;

        try {
            request.QueryInterface(Ci.nsIChannel);

            location = request.URI;
            originalLocation = request.originalURI;
        } catch (e) {}

        const ignoreBlank = this.isForInitialAboutBlank(
            webProgress,
            flags,
            location
        );

        if (
            (
                ignoreBlank &&
                flags & STATE_STOP &&
                flags & STATE_IS_NETWORK
            ) ||
            (
                !ignoreBlank && 
                this.blank
            )
        ) {
            this.blank = false;
        }

        if (
            flags & STATE_START && 
            flags & STATE_IS_NETWORK
        ) {
            this.requestCount++;

            if (webProgress.isTopLevel) {
                if (
                    !(
                        originalLocation &&
                        TabUtils.initialPages.includes(originalLocation.spec) &&
                        originalLocation !== "about:blank" &&
                        (
                            this.browser?.initialPageLoadedFromUserAction !==
                            originalLocation.spec
                        ) &&
                        this.browser?.currentURI &&
                        this.browser?.currentURI.spec == "about:blank"
                    )
                ) {
                    console.log("Started load")
                }

                delete (this.browser as any)
                    .initialPageLoadedFromUserAction;
                
                this.tab.crashed = false;
            }

            if (this.shouldShowProgress(request)) {
                if (
                    !(flags & STATE_RESTORING) &&
                    webProgress &&
                    webProgress.isTopLevel
                ) {
                    this.tab.busy = true;
                }
            }
        } else if (
            flags & STATE_STOP && 
            flags & STATE_IS_NETWORK
        ) {
            this.requestCount = 0;

            this.tab.busy = false;
            this.tab.progress == false;

            if (webProgress.isTopLevel) {
                const isSuccess = Components.isSuccessCode(status);

                if (
                    !isSuccess && 
                    !this.tab.isEmpty
                ) {
                    const { isNavigating } = this.browser;

                    if (this.tab.active && !isNavigating) {
                        console.log("reset URL");
                    }
                } else if (isSuccess) {
                    console.log("Finished loading")
                }
            }

            // If we don't have an icon set already, clear it
            if (
                !this.browser.mIconURL &&
                !ignoreBlank &&
                !(originalLocation.spec in TabUtils.faviconDefaults)
            ) {
                this.tab.icon = "";
            }
        }

        if (ignoreBlank) {
            this.callProgressListeners(
                "onUpdateCurrentBrowser",
                [flags, status, "", 0],
                true,
                false
            );
        } else {
            this.callProgressListeners(
                "onStateChange",
                [webProgress, request, flags, status],
                true,
                false
            );
        }

        this.callProgressListeners(
            "onStateChange",
            [webProgress, request, flags, status],
            false
        );

        if (flags & (STATE_START | STATE_STOP)) {
            this.message = "";
            this.totalProgress = 0;
        }

        this.stateFlags = flags;
        this.status = status;
    }

    public onLocationChange(
        webProgress: any, 
        request: any, 
        location: MozURI, 
        flags: number
    ) {
        if(
            !this.tab ||
            !this.browser
        ) return;

        const { isTopLevel } = webProgress;

        const isSameDocument = !!(
            flags & LOCATION_CHANGE_SAME_DOCUMENT
        );

        if (isTopLevel) {
            const isReload = !!(
                flags & LOCATION_CHANGE_RELOAD
            );
            const isErrorPage = !!(
                flags & LOCATION_CHANGE_ERROR_PAGE
            );

            // todo: check if user started load since last typing
            // if (
            //     this.browser?.didStartLoadSinceLastUserTyping() ||
            //     (isErrorPage && location.spec != "about:blank") ||
            //     (isSameDocument && this.browser?.isNavigating) ||
            //     (isSameDocument && !this.browser?.userTypedValue)
            // ) {
            //     this.browser.userTypedValue = null;
            // }

            if (this.tab && isErrorPage && this.tab?.busy) {
                this.tab.busy = false;
            }

            if (!isSameDocument) {
                // If the tab is audible, we stop the audio.
                if (this.tab?.audible) {
                    clearTimeout(this.tab.soundPlayingRemovalTimer);

                    this.tab.soundPlayingRemovalTimer = 0;
                    this.tab.audible = false;
                }

                // Restore the mute on the browser if the tab was previously muted
                if (this.tab?.muted) {
                    this.tab.linkedBrowser?.mute();
                }

                // todo: hide findbar here

                if (!isReload) {
                    TabUtils.setTabTitle(this.tab, true);
                }

                if (
                    this.tab.pending == false &&
                    webProgress.isLoadingDocument
                ) {
                    this.browser.mIconURL = null;
                }
            }

            if (!dot.utilities.isBlankPageURL(location.spec)) {
                this.browser.registeredOpenURI = location;
            }
        }

        if (!this.blank || this.browser.hasContentOpener) {
            this.callProgressListeners("onLocationChange", [
                webProgress,
                request,
                location,
                flags,
            ]);

            if (isTopLevel && !isSameDocument) {
                this.callProgressListeners("onContentBlockingEvent", [
                    webProgress,
                    null,
                    0,
                    true,
                ]);
            }
        }

        if (isTopLevel) {
            this.browser.lastURI = location;
            this.browser.lastLocationChange = Date.now();
        }
    }

    public onStatusChange(
        webProgress: any, 
        request: any, 
        status: any, 
        message: string
    ) {
        if (this.blank) return;

        this.callProgressListeners("onStatusChange", [
            webProgress,
            request,
            status,
            message,
        ]);

        this.message = message;
    }

    public onSecurityChange(
        webProgress: any, 
        request: any, 
        state: any
    ) {
        this.callProgressListeners("onSecurityChange", [
            webProgress,
            request,
            state,
        ]);
    }

    public onContentBlockingEvent(
        webProgress: any,
        request: any,
        event: any
    ) {
        this.callProgressListeners("onContentBlockingEvent", [
            webProgress,
            request,
            event,
        ]);
    }

    public onRefreshAttempted(
        webProgress: any, 
        uri: MozURI, 
        delay: any, 
        sameURI: MozURI
    ) {
        return this.callProgressListeners("onRefreshAttempted", [
            webProgress,
            uri,
            delay,
            sameURI,
        ]);
    }

    public QueryInterface = ChromeUtils.generateQI([
        "nsIWebProgressListener",
        "nsIWebProgressListener2",
        "nsISupportsWeakReference",
    ]);
}

export default TabProgressListener;