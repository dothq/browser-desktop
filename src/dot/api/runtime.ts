import { EventEmitter } from "events";
import { dot } from "../api";
import { ActorManagerParent, AppConstants, ChromeUtils, Ci, Services } from "../modules";
import { windowActors } from "../modules/glue";
import { WELCOME_SCREEN_URL } from "../shared/tab";

export class RuntimeAPI extends EventEmitter {
    public QueryInterface = ChromeUtils.generateQI(["nsIXULBrowserWindow"])

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

        dot.window.addWindowClass(AppConstants.platform);
        dot.window.addWindowClass(Services.locale.requestedLocale);
        dot.window.toggleWindowAttribute("lang", Services.locale.requestedLocale);

        dot.theme.load();
    }

    public onAfterBrowserPaint() {
        
    }

    public onBeforeBrowserQuit() {
        dot.window.onWindowStateUpdated();
    }

    public setOverLink(status: string) {
        dot.utilities.emit("page-status-changed", status);
    }

    constructor() {
        super();

        this.on("before-browser-window-init", this.onBeforeBrowserInit);
        this.on("browser-window-init", this.onBrowserStartup);
        this.on("before-browser-window-quit", this.onBeforeBrowserQuit);
    }
}
