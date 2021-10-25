import { MenuItem } from ".";
import { dot } from "../../api";

export class ViewPageSource extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public onClick() {
        const url = this.tab?.url;

        dot.tabs.create({
            url: `view-source:${url}`
        });
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "viewsource",
            type: "item",
            category: "development",

            label: "View Page Source",
            description:
                "Open the source viewer for the current page.",

            keybind: "CmdOrCtrl+U"
        });

        this.tabId = tabId;
    }
}
