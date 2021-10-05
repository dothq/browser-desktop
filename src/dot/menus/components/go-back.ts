import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class GoBack extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get disabled() {
        return !this.tab?.canGoBack;
    }

    public onClick() {
        return this.tab?.goBack();
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-back",
            type: "item",
            category: "page",

            label: "Back",
            icon: "back.svg",
            description: "Go back to the previous page.",

            hotkey: new Hotkey("Alt", "ArrowLeft")
        });

        this.tabId = tabId;
    }
}
