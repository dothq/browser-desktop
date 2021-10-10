import { MenuItem } from ".";
import { dot } from "../../api";

export class OpenVideoInNewTab extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-openvideotab",
            type: "item",
            category: "multimedia",

            label: "Open Video in New Tab",
            description:
                "Opens the selected video in a New Tab."
        });

        this.tabId = tabId;
    }
}
