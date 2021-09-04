import { dot } from "../api";
import { store } from "../app/store";
import { ipc } from "../core/ipc";
import { ChromeUtils, Ci } from "../modules";
import { MozURI } from "../types/uri";

export class TabProgressListener {
    public id: number;

    public constructor(id: number) {
        this.id = id;
    }

    public onStateChange(webProgress: any, request: any, flags: number, status: any) {
        if (!request) return;

        dot.tabs.get(this.id)?.updateNavigationState();

        const shouldShowLoader = (request: any) => {
            // We don't want to show tab loaders for about:* urls
            if (
                request instanceof Ci.nsIChannel &&
                request.originalURI.schemeIs("about")
            ) return false;

            return true;
        }

        const {
            STATE_START,
            STATE_IS_NETWORK,
            STATE_RESTORING,
            STATE_STOP
        } = Ci.nsIWebProgressListener;

        if (
            flags & STATE_START &&
            flags & STATE_IS_NETWORK
        ) {
            ipc.fire(`page-reload-${this.id}`);

            if (shouldShowLoader(request)) {
                if (
                    !(flags & STATE_RESTORING) &&
                    webProgress &&
                    webProgress.isTopLevel
                ) {
                    // started loading
                    store.dispatch({
                        type: "TAB_UPDATE",
                        payload: {
                            id: this.id,
                            state: "loading",
                            faviconUrl: "",
                            initialIconHidden: false
                        }
                    });
                }
            }
        } else if (
            flags & STATE_STOP
        ) {
            // finished loading
            store.dispatch({
                type: "TAB_UPDATE_STATE",
                payload: {
                    id: this.id,
                    state: "idle"
                }
            });
        }

        ipc.fire(
            `state-change-${this.id}`,
            {
                webProgress,
                request,
                flags,
                status
            }
        );
    }

    public onLocationChange(webProgress: any, request: any, location: MozURI, flags: any) {
        if (!webProgress.isTopLevel) return;

        // Ignore the initial about:blank, unless about:blank is requested
        if (request) {
            const url = request.QueryInterface(Ci.nsIChannel).originalURI.spec;
            if (location.spec == "about:blank" && url != "about:blank") return;
        }

        dot.tabs.get(this.id)?.updateNavigationState();

        ipc.fire(
            `location-change`,
            {
                id: this.id,
                webProgress,
                request,
                location,
                flags
            }
        );
    }

    public onContentBlockingEvent(webProgress: any, request: any, event: any, isSimulated: boolean) {
        ipc.fire(
            `content-blocked-${this.id}`,
            {
                webProgress,
                request,
                event,
                isSimulated
            }
        );
    }

    public onProgressChange(
        webProgress: any,
        request: any,
        curProgress: number,
        maxProgress: number,
        curTotalProgress: number,
        maxTotalProgress: number
    ) {
        ipc.fire(
            `progress-change-${this.id}`,
            {
                webProgress,
                request,
                curProgress,
                maxProgress,
                curTotalProgress,
                maxTotalProgress
            }
        );
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
        })

        ipc.fire(
            `security-change-${this.id}`,
            {
                webProgress,
                request,
                state
            }
        )
    }

    public QueryInterface = ChromeUtils.generateQI([
        "nsIWebProgressListener",
        "nsISupportsWeakReference",
    ])
}