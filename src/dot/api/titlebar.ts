import { EventEmitter } from "events";
import { dot } from "../app";

export class TitlebarAPI extends EventEmitter {
    get nativeTitlebarEnabled() {
        return !dot.window.windowClass.has("tabs-in-titlebar");
    }

    set nativeTitlebarEnabled(allowed: boolean) {
        if (allowed) {
            document.documentElement.removeAttribute("chromemargin");
            dot.window.removeWindowClass("tabs-in-titlebar");
        } else {
            document.documentElement.setAttribute("chromemargin", "0,2,2,2");
            dot.window.addWindowClass("tabs-in-titlebar");
        }
    }

    public onPageLocationChange(tabId: number) {
        console.log(tabId)
    }

    constructor() {
        super();

        this.on("page-location-change", this.onPageLocationChange)
    }
}