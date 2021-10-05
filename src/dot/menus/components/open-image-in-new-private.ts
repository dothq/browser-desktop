import { MenuItem } from ".";
import { dot } from "../../api";

export class OpenImageInNewPrivate extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-openimageprivate",
            type: "item",
            category: "image",

            label: "Open Image in New Private Window",
            description:
                "Opens the selected image in a New Private Window."
        });

        this.tabId = tabId;
    }
}
