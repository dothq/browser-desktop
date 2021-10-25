import { MenuItem } from ".";
import { dot } from "../../api";

export class Mute extends MenuItem {
    public tabId: number;
    public muted: boolean;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get label() {
        return this.muted ? "Unmute" : "Mute";
    }

    constructor({
        tabId,
        muted
    }: {
        tabId: number;
        muted: boolean;
    }) {
        super({
            id: "mutemedia",
            type: "item",
            category: "multimedia",

            description:
                "Toggle mute status of the media."
        });

        this.tabId = tabId;
        this.muted = muted;
    }
}
