import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class ReloadTab extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }


    public onClick() {
        this.tab?.reload();
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-reloadtab",
            type: "item",
            category: "page",

            label: "Reload Tab",
            icon: "reload.svg",
            description: "Reload the current tab.",

            hotkey: new Hotkey("Ctrl", "R")
        })

        this.tabId = tabId;
    }
}