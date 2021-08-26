import { MenuItem } from ".";
import { dot } from "../../api";

export class MuteTab extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-mutetab",
            type: "item",
            category: "page",

            label: "Mute Tab",
            description: "Mutes the current tab."
        })

        this.tabId = tabId;
    }
}