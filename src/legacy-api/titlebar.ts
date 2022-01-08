import { makeAutoObservable } from "mobx";
import { dot } from "../api";

export class TitlebarAPI {
    get nativeTitlebarEnabled() {
        return !!document.documentElement.getAttribute(
            "chromemargin"
        );
    }

    set nativeTitlebarEnabled(allowed: boolean) {
        if (allowed) {
            document.documentElement.removeAttribute(
                "chromemargin"
            );
            dot.window.removeWindowClass(
                "tabs-in-titlebar"
            );
        } else {
            document.documentElement.setAttribute(
                "chromemargin",
                "0,2,2,2"
            );
            dot.window.addWindowClass("tabs-in-titlebar");
        }
    }

    constructor() {
        makeAutoObservable(this);
    }
}
