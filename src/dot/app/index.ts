import { 
    ConsoleAPI,
    DevAPI,
    ExtensionsAPI,
    RuntimeAPI,
    TabsAPI,
    ThemeAPI,
    TitlebarAPI,
    UtilitiesAPI,
    WindowAPI
} from "../api";

import { exportPublic } from "../shared/globals";

class Dot {
    public titlebar = new TitlebarAPI();
    public tabs = new TabsAPI();
    public theme = new ThemeAPI();
    public extensions = new ExtensionsAPI();
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
        
        window.addEventListener("beforeunload", (event) => {
            event.stopPropagation();
            event.preventDefault();

            this.runtime.emit("before-browser-window-quit");

            return window.close();
        })
    }
}

export const dot = new Dot();
exportPublic("dot", dot);