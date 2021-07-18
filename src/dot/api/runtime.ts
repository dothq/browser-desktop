import { EventEmitter } from "events";
import { dot } from "../api";
import { ActorManagerParent, ChromeUtils, Ci } from "../modules";
import { windowActors } from "../modules/glue";
import { WELCOME_SCREEN_URL } from "../shared/tab";

export class RuntimeAPI extends EventEmitter {
    public QueryInterface = ChromeUtils.generateQI(["nsIXULBrowserWindow"])

    private _windowStateInt;

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

        dot.tabs.create({
            url: WELCOME_SCREEN_URL
        });

        dot.window.addWindowClass(dot.utilities.platform);
        dot.window.addWindowClass(dot.utilities.browserLanguage);
        dot.window.addWindowClass("tabs-in-titlebar", dot.titlebar.nativeTitlebarEnabled);
        dot.window.toggleWindowAttribute("lang", dot.utilities.browserLanguage);

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

        this.on("before-browser-window-init", this.onBeforeBrowserInit);
        this.on("browser-window-init", this.onBrowserStartup);
        this.on("before-browser-window-quit", this.onBeforeBrowserQuit);

        this._windowStateInt = setInterval(() => {
            dot.window.onWindowStateUpdated();
        }, 10000);
    }
}
