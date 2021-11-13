import { EventEmitter } from "events";
import { render } from "..";
import { dot } from "../api";
import {
    ActorManagerParent,
    BrowserWindowTracker, Ci, Services
} from "../modules";
import { windowActors } from "../modules/glue";
import { BrowserAccess } from "../services/browser-access";
import { timers } from "../services/timers";
import { XULBrowserWindow } from "../utils/xul-browser";

export class RuntimeAPI extends EventEmitter {
    private _windowStateInt: NodeJS.Timeout;

    public onBeforeBrowserInit() {

    }

    public onBrowserStartup() {
        timers.start("BrowserInit");

        window.XULBrowserWindow = XULBrowserWindow;
        window.docShell.treeOwner
            .QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIAppWindow)
            .XULBrowserWindow = window.XULBrowserWindow;

        window.browserDOMWindow = new BrowserAccess();

        try {
            ActorManagerParent.addJSWindowActors(
                windowActors
            );
        } catch (e: any) {
            if (e.name == "NotSupportedError") return;
            throw e;
        }

        dot.utilities.doCommand("Browser:NewTab");

        render();

        dot.window.updateWindowState();

        dot.shortcuts.init();
        dot.theme.load();
        dot.prefs.observe(
            "dot.ui.accent_colour",
            (value: string) =>
                dot.theme.updateAccentColour(value)
        );

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
            "dot.ui.statusbar.disabled",
            (value: boolean) => {
                const className = "statusbar-hidden";

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

        dot.prefs.observe(
            "dot.ui.statusbar.type",
            (value: 'floating' | 'fixed') => {
                const allowedValues = ["floating", "fixed"];

                let className = (
                    value && 
                    value.length && 
                    allowedValues.includes(value)
                )
                    ? `statusbar-${value}`
                    : "statusbar-floating";

                for(const v of allowedValues) {
                    dot.window.removeWindowClass(
                        `statusbar-${v}`,
                        document.documentElement
                    )
                }

                dot.window.addWindowClass(
                    className,
                    true,
                    document.documentElement
                );
            },
            true
        )

        Services.obs.notifyObservers(
            window,
            "extensions-late-startup"
        );

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
        dot.menus.clear();
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
