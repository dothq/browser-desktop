import { makeObservable, observable } from "mobx";
import { dot } from "../api";
import { ipc } from "../core/ipc";
import { ChromeUtils, Ci } from "../modules";
import { MozURI } from "../types/uri";

const shouldShowLoader = (request: any) => {
    // We don't want to show tab loaders for about:* urls
    if (
        request instanceof Ci.nsIChannel &&
        request.originalURI.schemeIs("about")
    )
        return false;

    return true;
};

export class TabProgressListener {
    @observable
    public id: number;

    public constructor(id: number) {
        makeObservable(this);

        this.id = id;
    }

    public isForInitialAboutBlank(webProgress: any, flags: any, location: any) {
        if (!webProgress.isTopLevel) return false;
    
        if (
            flags & Ci.nsIWebProgressListener.STATE_STOP &&
            !location
        ) {
            return true;
        }
    
        const url = location ? location.spec : "";
        return url == "about:blank";
    }

    public onStateChange(
        webProgress: any,
        request: any,
        flags: number,
        status: any
    ) {
        const tab = dot.tabs.get(this.id);

        if (!request || !tab) return;

        tab.updateNavigationState();

        const {
            STATE_START,
            STATE_IS_NETWORK,
            STATE_RESTORING,
            STATE_STOP,
            STATE_IS_WINDOW,
            STATE_IS_DOCUMENT
        } = Ci.nsIWebProgressListener;

        const isStarting = flags & STATE_START;
        const isStopped = flags & STATE_STOP;
        const isWindow = flags & STATE_IS_WINDOW;
        const isDocument = flags & STATE_IS_DOCUMENT;

        if (isDocument && isStarting) {
            ipc.fire(`page-reload-${this.id}`);
            // General event is used by the search bar because why not
            ipc.fire("page-reload", this.id);

            if (shouldShowLoader(request)) {
                if (
                    !(flags & STATE_RESTORING) &&
                    webProgress &&
                    webProgress.isTopLevel
                ) {
                    tab.clearPendingIcon();

                    // started loading
                    tab.state = "loading";
                    tab.loadingStage = "busy";
                }
            }
        } else if (isWindow && isStopped) {
            // finished loading
            tab.state = "idle";
            tab.loadingStage = "";

            const ignoreBlank = this.isForInitialAboutBlank(
                webProgress,
                flags,
                location
            )
            
            if (
                !tab.webContents.mIconURL &&
                !ignoreBlank
            ) {
                tab.clearPendingIcon();
            }
        }

        ipc.fire(`state-change-${this.id}`, {
            webProgress,
            request,
            flags,
            status
        });
    }

    public onLocationChange(
        webProgress: any,
        request: any,
        location: MozURI,
        flags: any
    ) {
        const tab = dot.tabs.get(this.id);

        if(!tab) return;

        const { isTopLevel } = webProgress;

        const isSameDocument = !!(
            flags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT
        );

        if(isTopLevel) {
            const isReload = !!(
                flags & Ci.nsIWebProgressListener.LOCATION_CHANGE_RELOAD
            );
            
            const isErrorPage = !!(
                flags & Ci.nsIWebProgressListener.LOCATION_CHANGE_ERROR_PAGE
            );

            if(!isSameDocument) {
                clearTimeout(tab.audioPlayingRemovalInt);
                tab.audioPlayingRemovalInt = null;
                tab.audioPlaying = false;

                if(!isReload) {
                    tab.updateTitle();
                }

                if (
                    tab.state == "idle" &&
                    webProgress.isLoadingDocument
                ) {
                    tab.webContents.mIconURL = null;
                }
            }

            // Ignore the initial about:blank, unless about:blank is requested
            if (request) {
                const url = request.QueryInterface(
                    Ci.nsIChannel
                ).originalURI.spec;
                if (
                    location.spec == "about:blank" &&
                    url != "about:blank"
                )
                    return;
            }

            tab?.updateNavigationState();
        }

        dot.window.updateWindowTitle();

        ipc.fire(`location-change`, {
            id: this.id,
            webProgress,
            request,
            location,
            flags
        });
    }

    public onContentBlockingEvent(
        webProgress: any,
        request: any,
        event: any,
        isSimulated: boolean
    ) {
        ipc.fire(`content-blocked-${this.id}`, {
            webProgress,
            request,
            event,
            isSimulated
        });
    }

    public onProgressChange(
        webProgress: any,
        request: any,
        curProgress: number,
        maxProgress: number,
        curTotalProgress: number,
        maxTotalProgress: number
    ) {
        const totalProgress = maxTotalProgress
            ? curTotalProgress / maxTotalProgress
            : 0

        if (!shouldShowLoader(request)) return;
    
        const tab = dot.tabs.get(this.id);

        if(tab) {
            if (totalProgress) {
                tab.loadingStage = "progress";
            }
        }

        ipc.fire(`progress-change-${this.id}`, {
            webProgress,
            request,
            curProgress,
            maxProgress,
            curTotalProgress,
            maxTotalProgress
        });
    }

    public onSecurityChange(
        webProgress: any,
        request: any,
        state: any
    ) {
        const tab = dot.tabs.get(this.id);

        if(tab) {
            tab.contentState = state
        }

        ipc.fire(`security-change-${this.id}`, {
            webProgress,
            request,
            state
        });
    }

    public QueryInterface = ChromeUtils.generateQI([
        "nsIWebProgressListener",
        "nsISupportsWeakReference"
    ]);
}
