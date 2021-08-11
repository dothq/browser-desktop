import { MenuItem } from ".";
import { dot } from "../../api";

export class CopyImageLink extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-copyimagelink",
            type: "item",
            category: "image",

            label: "Copy Image Link",
            description: "Copies the selected image link to your clipboard."
        })

        this.tabId = tabId;
    }
}