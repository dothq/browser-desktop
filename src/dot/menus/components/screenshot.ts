import { MenuItem } from ".";
import { dot } from "../../api";

export class ScreenshotPage extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-screenshot",
            type: "item",
            category: "general",

            label: "Screenshot…",
            icon: "screenshot.svg",
            description: "Take a screenshot of the page."
        })

        this.tabId = tabId;
    }
}