import { MenuItem } from ".";
import { dot } from "../../api";

export class PlayInPiP extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-pipmedia",
            type: "item",
            category: "multimedia",

            label: "Watch in Picture-in-Picture",
            description: "Toggle Picture-in-Picture mode."
        });

        this.tabId = tabId;
    }
}
