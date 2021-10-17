import { EventEmitter } from "events";
import { dot } from "../api";
import {
    ActorManagerParent, BrowserWindowTracker,
    Cc,
    ChromeUtils,
    Ci, Services
} from "../modules";
import { windowActors } from "../modules/glue";
import { BrowserAccess } from "../services/browser-access";
import StatusService from "../services/status";
import { MozURI } from "../types/uri";
import { BrowserUIUtils } from "../utils/browser-ui";

export class RuntimeAPI extends EventEmitter {
    public QueryInterface = ChromeUtils.generateQI([
        "nsIWebProgressListener",
        "nsIWebProgressListener2",
        "nsISupportsWeakReference",
        "nsIXULBrowserWindow",
    ]);

    private _windowStateInt: NodeJS.Timeout;

    public onBeforeBrowserInit() {
        
    }

    public onBrowserStartup() {
        window.docShell.treeOwner
            .QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(
                Ci.nsIAppWindow
            ).XULBrowserWindow = this;

        window.XULBrowserWindow =
            window.docShell.treeOwner
                .QueryInterface(Ci.nsIInterfaceRequestor)
                .getInterface(
                    Ci.nsIAppWindow
                ).XULBrowserWindow;

        window.browserDOMWindow = new BrowserAccess();

        try {
            ActorManagerParent.addJSWindowActors(
                windowActors
            );
        } catch (e: any) {
            if (e.name == "NotSupportedError") return;
            throw e;
        }

        dot.window.updateWindowState();

        dot.theme.load();
        dot.prefs.observe(
            "dot.ui.accent_colour",
            (value: string) =>
                dot.theme.updateAccentColour(value)
        );

        dot.utilities.doCommand("Browser:NewTab");

        BrowserWindowTracker.track(window);

        dot.window.addWindowClass(dot.utilities.platform);
        dot.window.addWindowClass(
            dot.utilities.browserLanguage
        );
        dot.window.addWindowClass(
            "tabs-in-titlebar",
            dot.titlebar.nativeTitlebarEnabled
        );
        dot.window.toggleWindowAttribute(
            "lang",
            dot.utilities.browserLanguage
        );

        // We should support rounded corners on more DEs, but Ubuntu's Unity is
        // is the only one that definitely supports it.
        const isUbuntu =
            dot.utilities.linuxDesktopEnvironment
                .toLowerCase()
                .includes("unity");

        document.documentElement.style.setProperty(
            "--window-roundness",
            (isUbuntu ? 4 : 0) + "px"
        );

        dot.prefs.observe(
            "dot.window.nativecontrols.enabled",
            (value: boolean) => {
                if (value)
                    dot.window.addWindowClass(
                        "native-window-controls"
                    );
                else
                    dot.window.removeWindowClass(
                        "native-window-controls"
                    );
            },
            true
        );

        dot.prefs.observe(
            "ui.popup.disable_autohide",
            (value: boolean) => {
                dot.utilities.canPopupAutohide = !value;
            },
            true
        );

        dot.prefs.observe(
            "dot.ui.statusbar.enabled",
            (value: boolean) => {
                const className = "statusbar";

                if (value)
                    dot.window.addWindowClass(
                        className,
                        true,
                        document.documentElement
                    );
                else
                    dot.window.removeWindowClass(
                        className,
                        document.documentElement
                    );
            },
            true
        );

        Services.obs.notifyObservers(
            window,
            "extensions-late-startup"
        );
    }

    public onAfterBrowserPaint() {
        dot.window.onWindowStateUpdated();
    }

    public onBeforeBrowserQuit() {
        dot.window.onWindowStateUpdated();

        clearInterval(this._windowStateInt);
    }

    public onBrowserFocus() { }

    public onBrowserBlur() {
        dot.menus.clear();
    }

    public showTooltip(
        x: number,
        y: number,
        data: string,
        direction: string
    ) {
        if (
            Cc["@mozilla.org/widget/dragservice;1"]
                .getService(Ci.nsIDragService)
                .getCurrentSession()
        ) {
            return;
        }

        let el: any =
            document.getElementById("aHTMLTooltip");
        el.label = data;
        el.style.direction = direction;
        el.openPopupAtScreen(x, y, false, null);
    }

    public hideTooltip() {
        let el: any =
            document.getElementById("aHTMLTooltip");
        el.hidePopup();
    }

    public status = ""
    public defaultStatus = ""
    public overLink = ""
    public startTime = 0
    public isBusy = false
    public busyUI = false

    public setDefaultStatus(status: string) {
        this.defaultStatus = status;
        StatusService.update();
    }

    public setOverLink(url: string) {
        if (url) {
            url = Services.textToSubURI.unEscapeURIForUI(url);

            // Encode bidirectional formatting characters.
            // (RFC 3987 sections 3.2 and 4.1 paragraph 6)
            url = url.replace(
                /[\u200e\u200f\u202a\u202b\u202c\u202d\u202e]/g,
                encodeURIComponent
            );
        }

        this.overLink = url;
    }

    public getTabCount() {
        return dot.tabs.list.length;
    }

    public onStateChange(
        webProgress: any,
        request: any,
        stateFlags: any,
        status: any
    ) {

    }

    public onLocationChange(
        webProgress: any,
        request: any,
        location: MozURI,
        flags: any,
        isSimulated: boolean
    ) {
        const uri = location
            ? location.spec
            : "";

        // todo: Update back and forward buttons here instead of whenever Redux updates

        Services.obs.notifyObservers(
            webProgress,
            "touchbar-location-change",
            uri
        );

        if (!webProgress.isTopLevel) return;

        this.setOverLink("");

        if (
            (
                uri == "about:blank" &&
                BrowserUIUtils.checkEmptyPageOrigin(
                    dot.tabs.selectedTab?.webContents
                )
            ) ||
            uri == ""
        ) {
            // Disable reload button
        } else {
            // Enable reload button
        }

        this.updateElementsForContentType();
    }

    public onStatusChange(
        webProgress: any,
        request: any,
        status: any,
        message: any
    ) {
        this.status = message;
        StatusService.update();
    }

    // Stubs
    public updateElementsForContentType() { }
    public asyncUpdateUI() { }
    public onContentBlockingEvent() { }
    public onSecurityChange() { }

    _state: null
    _lastLocation: null
    _event: null
    _lastLocationForEvent: null
    _isSecureContext: null

    public onUpdateCurrentBrowser(
        stateFlags: number,
        status: any,
        message: any,
        totalProgress: any
    ) {
        const { nsIWebProgressListener } = Ci;

        const browser = dot.tabs.selectedTab?.webContents;

        this.hideTooltip();

        const doneLoading = stateFlags & nsIWebProgressListener.STATE_STOP;

        this.onStateChange(
            browser.webProgress,
            { URI: browser.currentURI },
            doneLoading
                ? nsIWebProgressListener.STATE_STOP
                : nsIWebProgressListener.STATE_START,
            status
        );

        if (!doneLoading) this.onStatusChange(
            browser.webProgress,
            null,
            0,
            message
        );
    }

    constructor() {
        super();

        this.once(
            "before-browser-window-init",
            this.onBeforeBrowserInit
        );
        this.once(
            "browser-window-init",
            this.onBrowserStartup
        );

        this.on(
            "browser-window-focus",
            this.onBrowserFocus
        );
        this.on(
            "browser-window-blur",
            this.onBrowserBlur
        );

        this.on(
            "before-browser-window-quit",
            this.onBeforeBrowserQuit
        );

        this._windowStateInt = setInterval(() => {
            try {
                dot.window.onWindowStateUpdated();
            } catch (e) { }
        }, 10000);
    }
}
