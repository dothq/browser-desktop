import { MenuItem } from ".";
import { dot } from "../../api";

export class Speed extends MenuItem {
    public tabId: number;
    public fullscreen: boolean;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get label() {
        return this.fullscreen ? "Exit Fullscreen" : "Enter Fullscreen";
    }

    constructor({ tabId, fullscreen }: { tabId: number, fullscreen: boolean }) {
        super({
            id: "context-fullscreenmedia",
            type: "item",
            category: "multimedia",

            description: "Toggle fullscreen mode of the media."
        })

        this.tabId = tabId;
        this.fullscreen = fullscreen;
    }
}