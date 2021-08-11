import { MenuItem } from ".";
import { dot } from "../../api";

export class CopyImage extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-copyimage",
            type: "item",
            category: "image",

            label: "Copy Image",
            description: "Copies the selected image to your clipboard."
        })

        this.tabId = tabId;
    }
}