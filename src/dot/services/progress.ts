import { dot } from "../api";
import { store } from "../app/store";
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
    public id: number;

    public constructor(id: number) {
        this.id = id;
    }

    public onStateChange(
        webProgress: any,
        request: any,
        flags: number,
        status: any
    ) {
        if (!request) return;

        const tab = dot.tabs.get(this.id);

        tab?.updateNavigationState();

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
                    tab?.clearPendingIcon();

                    // started loading
                    store.dispatch({
                        type: "TAB_UPDATE",
                        payload: {
                            id: this.id,
                            state: "loading",
                            loadingStage: "busy"
                        }
                    });
                }
            }
        } else if (isWindow && isStopped) {
            // finished loading
            store.dispatch({
                type: "TAB_UPDATE",
                payload: {
                    id: this.id,
                    state: "idle",
                    loadingStage: ""
                }
            });
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
                if(!isReload) {
                    tab?.updateTitle();
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
                store.dispatch({
                    type: "TAB_UPDATE",
                    payload: {
                        id: this.id,
                        loadingStage: "progress"
                    }
                });
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
        store.dispatch({
            type: "TAB_UPDATE",
            payload: {
                id: this.id,
                contentState: state
            }
        });

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
