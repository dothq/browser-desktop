import { MenuItem } from ".";
import { dot } from "../../api";

export class OpenImageInNewWindow extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-openimagewindow",
            type: "item",
            category: "image",

            label: "Open Image in New Window",
            description: "Opens the selected image in a New Window."
        })

        this.tabId = tabId;
    }
}