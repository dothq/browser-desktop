import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class SavePageAs extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-savepage",
            type: "item",
            category: "general",

            label: "Save As…",
            description: "Save the current page to file.",

            hotkey: new Hotkey("Ctrl", "S")
        });

        this.tabId = tabId;
    }
}
