import { MenuItem } from ".";
import { dot } from "../../api";

export class CopyLink extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-copylink",
            type: "item",
            category: "link",

            label: "Copy Link",
            description:
                "Copies the selected link to your clipboard."
        });

        this.tabId = tabId;
    }
}
