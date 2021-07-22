export * from './browsers';
export * from './console';
export * from './dev';
export * from './extensions';
export * from './menu';
export * from './preferences';
export * from './runtime';
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
    MenuAPI,
    PreferencesAPI,
    RuntimeAPI,
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
    public menu = new MenuAPI();
    public dev = new DevAPI();
    public runtime = new RuntimeAPI();
    public utilities = new UtilitiesAPI();
    public console = new ConsoleAPI();
    public window = new WindowAPI();

    constructor() {
        this.runtime.emit("before-browser-window-init");

        window.addEventListener("DOMContentLoaded", () => {
            this.runtime.emit("browser-window-init");
        });
        
        window.addEventListener("unload", async (event) => {
            await this.window.onWindowStateUpdated();

            return window.close();
        })
    }
}

export const dot = new Dot();
exportPublic("dot", dot);