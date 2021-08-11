import { MenuItem } from ".";
import { dot } from "../../api";

export class OpenImageInNewTab extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-openimagetab",
            type: "item",
            category: "image",

            label: "Open Image in New Tab",
            description: "Opens the selected image in a New Tab."
        })

        this.tabId = tabId;
    }
}