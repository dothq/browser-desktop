import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class ViewPageSource extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-viewsource",
            type: "item",
            category: "development",

            label: "View Page Source",
            description: "Open the source viewer for the current page.",

            hotkey: new Hotkey("Ctrl", "U")
        })

        this.tabId = tabId;
    }
}