import { EventEmitter } from "events";
import { dot } from "../api";
import {
    ActorManagerParent,
    BrowserWindowTracker,
    Ci,
    Services
} from "../modules";
import { windowActors } from "../modules/glue";
// import { BrowserAccess } from "../services/browser-access";
import { timers } from "../services/timers";
import Tab from "../tab";
// import { XULBrowserWindow } from "../utils/xul-browser";

export class RuntimeAPI extends EventEmitter {
    private _windowStateInt: NodeJS.Timeout;

    public onBeforeBrowserInit() {}

    public onBrowserStartup() {
        timers.start("BrowserInit");

        dot.theme.load();

        // window.XULBrowserWindow = XULBrowserWindow;
        // window.docShell.treeOwner
        //     .QueryInterface(Ci.nsIInterfaceRequestor)
        //     .getInterface(Ci.nsIAppWindow)
        //     .XULBrowserWindow = window.XULBrowserWindow;

        // window.browserDOMWindow = new BrowserAccess();

        try {
            ActorManagerParent.addJSWindowActors(
                windowActors
            );
        } catch (e: any) {
            if (e.name !== "NotSupportedError") throw e;
        }

        // dot.shortcuts.init();

        // new PreferenceObserversStartup();
        // new TabStartupService();

        try {
            // This should always be ran after the tab is created
            BrowserWindowTracker.track(window);
        } catch (e) {}

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

        Services.obs.notifyObservers(
            window,
            "extensions-late-startup"
        );

        window.docShell.treeOwner.QueryInterface(
            Ci.nsIBaseWindow
        ).visibility = true;

        dot.window.updateWindowState();

        new Tab();

        timers.stop("BrowserInit");
    }

    public onAfterBrowserPaint() {
        dot.window.onWindowStateUpdated();
    }

    public onBeforeBrowserQuit() {
        dot.window.onWindowStateUpdated();

        clearInterval(this._windowStateInt);
    }

    public onBrowserFocus() {}

    public onBrowserBlur() {
        // dot.menus.clear();
    }

    constructor() {
        super();

        this.once(
            "before-browser-window-init",
            this.onBeforeBrowserInit
        );
        this.on(
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
            } catch (e) {}
        }, 10000);
    }
}
