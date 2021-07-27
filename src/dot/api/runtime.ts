import { EventEmitter } from "events";
import { dot } from "../api";
import { store } from "../app/store";
import { ActorManagerParent, ChromeUtils, Ci } from "../modules";
import { windowActors } from "../modules/glue";
import { WELCOME_SCREEN_URL } from "../shared/tab";

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

        store.dispatch({
            type: "TAB_CREATE",
            payload: {
                url: WELCOME_SCREEN_URL
            }
        });

        dot.tabs.maybeHideTabs();

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

        dot.theme.load();
    }

    public onAfterBrowserPaint() {
        dot.window.onWindowStateUpdated();
    }

    public onBeforeBrowserQuit() {
        dot.window.onWindowStateUpdated();

        clearInterval(this._windowStateInt);
    }

    public setOverLink(status: string) {
        dot.utilities.emit("page-status-changed", status);
    }

    constructor() {
        super();

        this.once("before-browser-window-init", this.onBeforeBrowserInit);
        this.once("browser-window-init", this.onBrowserStartup);
        this.on("before-browser-window-quit", this.onBeforeBrowserQuit);

        this._windowStateInt = setInterval(() => {
            try {
                dot.window.onWindowStateUpdated();
            } catch (e) { }
        }, 10000);
    }
}
