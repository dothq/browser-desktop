export * from "./browsers";
export * from "./console";
export * from "./dev";
export * from "./extensions";
export * from "./menus";
export * from "./preferences";
export * from "./prompt";
export * from "./runtime";
export * from "./storage";
export * from "./tabs";
export * from "./theme";
export * from "./titlebar";
export * from "./utilities";
export * from "./window";

import {
    BrowsersAPI,
    ConsoleAPI,
    DevAPI,
    ExtensionsAPI,
    MenusAPI,
    PreferencesAPI,
    PromptAPI,
    RuntimeAPI,
    StorageAPI,
    TabsAPI,
    ThemeAPI,
    TitlebarAPI,
    UtilitiesAPI,
    WindowAPI
} from ".";
import { ipc } from "../core/ipc";
import { Search } from "../core/search";
import { KeyboardShortcuts } from "../core/shortcuts";
import { exportPublic } from "../shared/globals";

export class Dot {
    public browsersPrivate: BrowsersAPI =
        new BrowsersAPI();

    public titlebar = new TitlebarAPI();
    public tabs = new TabsAPI();
    public prefs = new PreferencesAPI();
    public theme = new ThemeAPI();
    public extensions = new ExtensionsAPI();
    public menus = new MenusAPI();
    public dev = new DevAPI();
    public prompt = new PromptAPI();
    public search = new Search();
    public runtime = new RuntimeAPI();
    public storage = new StorageAPI();
    public shortcuts = new KeyboardShortcuts(window);
    public utilities = new UtilitiesAPI();
    public console = new ConsoleAPI();
    public window = new WindowAPI();

    public constructor() {
        window.addEventListener(
            "MozBeforeInitialXULLayout",
            () =>
                this.runtime.emit(
                    "before-browser-window-init"
                ),
            { once: true }
        );

        window.addEventListener(
            "DOMContentLoaded",
            () => {
                this.runtime.emit("browser-window-init");
            },
            { once: true }
        );

        window.addEventListener("focus", () =>
            this.runtime.emit("browser-window-focus")
        );

        window.addEventListener("blur", () =>
            this.runtime.emit("browser-window-blur")
        );

        window.addEventListener(
            "AppCommand",
            (event) => this.window.onAppCommand(event),
            true
        );

        window.addEventListener(
            "unload",
            async (event) => {
                await this.window.onWindowStateUpdated();

                return window.close();
            }
        );

        ipc.on("location-change", (e) => console.log(e.data.location.spec))
    }
}

export let dot: Dot;

if (window.isChromeWindow !== undefined) {
    dot = new Dot();

    exportPublic("dot", dot);
}
