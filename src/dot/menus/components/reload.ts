import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class Reload extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public onClick() {
        return this.tab?.reload();
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-reload",
            type: "item",
            category: "page",

            label: "Reload",
            icon: "reload.svg",
            description: "Reload the current page.",

            hotkey: new Hotkey("Ctrl", "R")
        })

        this.tabId = tabId;
    }
}