import { MenuItem } from ".";
import { dot } from "../../api";

export class CopyVideoLink extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "copyvideolink",
            type: "item",
            category: "multimedia",

            label: "Copy Video Link",
            description:
                "Copies the selected video link to your clipboard."
        });

        this.tabId = tabId;
    }
}
