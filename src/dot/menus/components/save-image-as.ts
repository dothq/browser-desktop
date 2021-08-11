import { MenuItem } from ".";
import { dot } from "../../api";

export class SaveImageAs extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-saveimage",
            type: "item",
            category: "image",

            label: "Save Image As…",
            description: "Saves the selected image to file."
        })

        this.tabId = tabId;
    }
}