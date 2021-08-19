import { EventEmitter } from "events";
import { dot } from "../api";
import { store } from "../app/store";
import { ActorManagerParent, BrowserWindowTracker, ChromeUtils, Ci, Services } from "../modules";
import { windowActors } from "../modules/glue";
import { NEW_TAB_URL } from "../shared/tab";

export class RuntimeAPI extends EventEmitter {
    public QueryInterface = ChromeUtils.generateQI(["nsIXULBrowserWindow"])

    private _windowStateInt: NodeJS.Timeout;

    public onBeforeBrowserInit() {
        window.docShell
            .treeOwner
            .QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIAppWindow)
            .XULBrowserWindow = this;

        window.XULBrowserWindow = window.docShell
            .treeOwner
            .QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIAppWindow)
            .XULBrowserWindow;

        ActorManagerParent.addJSWindowActors(windowActors);
    }

    public onBrowserStartup() {
        dot.window.updateWindowState();

        dot.theme.load();
        dot.prefs.observe(
            "dot.ui.accent_colour",
            (value: string) => dot.theme.updateAccentColour(value)
        );

        store.dispatch({
            type: "TAB_CREATE",
            payload: {
                url: NEW_TAB_URL
            }
        });

        BrowserWindowTracker.track(window);

        dot.tabs.maybeHideTabs(true);

        dot.window.addWindowClass(dot.utilities.platform);
        dot.window.addWindowClass(dot.utilities.browserLanguage);
        dot.window.addWindowClass("tabs-in-titlebar", dot.titlebar.nativeTitlebarEnabled);
        dot.window.toggleWindowAttribute("lang", dot.utilities.browserLanguage);

        // We should support rounded corners on more DEs, but Ubuntu's Unity is
        // is the only one that definitely supports it.
        const isUbuntu = dot.utilities.linuxDesktopEnvironment
            .toLowerCase()
            .includes("unity");

        document.documentElement.style.setProperty(
            "--window-roundness",
            (isUbuntu ? 4 : 0) + "px"
        );

        store.subscribe(() => {
            dot.tabs.maybeHideTabs();
        })

        dot.prefs.observe(
            "dot.window.nativecontrols.enabled",
            (value: boolean) => {
                if (value) dot.window.addWindowClass("native-window-controls")
                else dot.window.removeWindowClass("native-window-controls")
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
    }

    public onAfterBrowserPaint() {
        dot.window.onWindowStateUpdated();
    }

    public onBeforeBrowserQuit() {
        dot.window.onWindowStateUpdated();

        clearInterval(this._windowStateInt);
    }

    public onBrowserFocus() {

    }

    public onBrowserBlur() {
        dot.menus.clear();
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

            // Remove trailing slash
            url = url.replace(/\/$/, "");
        }

        store.dispatch({
            type: "TAB_UPDATE",
            payload: {
                id: dot.tabs.selectedTabId,
                pageStatus: url
            }
        });
    }

    constructor() {
        super();

        this.once("before-browser-window-init", this.onBeforeBrowserInit);
        this.once("browser-window-init", this.onBrowserStartup);

        this.on("browser-window-focus", this.onBrowserFocus);
        this.on("browser-window-blur", this.onBrowserBlur);

        this.on("before-browser-window-quit", this.onBeforeBrowserQuit);

        this._windowStateInt = setInterval(() => {
            try {
                dot.window.onWindowStateUpdated();
            } catch (e) { }
        }, 10000);
    }
}
