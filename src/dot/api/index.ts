export * from './browsers';
export * from './console';
export * from './dev';
export * from './extensions';
export * from './menus';
export * from './preferences';
export * from './prompt';
export * from './runtime';
export * from './settings';
export * from './tabs';
export * from './theme';
export * from './titlebar';
export * from './utilities';
export * from './window';

import {
    BrowsersAPI,
    ConsoleAPI,
    DevAPI,
    ExtensionsAPI,
    MenusAPI,
    PreferencesAPI,
    PromptAPI,
    RuntimeAPI,
    SettingsAPI,
    TabsAPI,
    ThemeAPI,
    TitlebarAPI,
    UtilitiesAPI,
    WindowAPI
} from ".";
import { exportPublic } from "../shared/globals";

class Dot {
    public browsersPrivate = new BrowsersAPI();

    public titlebar = new TitlebarAPI();
    public tabs = new TabsAPI();
    public prefs = new PreferencesAPI();
    public theme = new ThemeAPI();
    public extensions = new ExtensionsAPI();
    public menus = new MenusAPI();
    public dev = new DevAPI();
    public prompt = new PromptAPI();
    public runtime = new RuntimeAPI();
    public utilities = new UtilitiesAPI();
    public console = new ConsoleAPI();
    public settings = new SettingsAPI();
    public window = new WindowAPI();

    constructor() {
        this.runtime.emit("before-browser-window-init");

        window.addEventListener("DOMContentLoaded", () => {
            this.runtime.emit("browser-window-init");
        });

        window.addEventListener(
            "focus",
            () => this.runtime.emit("browser-window-focus")
        );

        window.addEventListener(
            "blur",
            () => this.runtime.emit("browser-window-blur")
        );

        window.addEventListener(
            "AppCommand",
            (event) => this.window.onAppCommand(event),
            true
        )

        window.addEventListener("unload", async (event) => {
            await this.window.onWindowStateUpdated();

            return window.close();
        })
    }
}

export const dot = new Dot();
exportPublic("dot", dot);