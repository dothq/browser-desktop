import { MenuItem } from ".";
import { dot } from "../../api";

export class ScreenshotVideo extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-screenshotvideo",
            type: "item",
            category: "multimedia",

            label: "Screenshot video…",
            icon: "screenshot.svg",
            description: "Take a screenshot of the video."
        })

        this.tabId = tabId;
    }
}