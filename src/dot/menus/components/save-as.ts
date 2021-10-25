import { MenuItem } from ".";
import { dot } from "../../api";

export class SavePageAs extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "savepage",
            type: "item",
            category: "general",

            label: "Save As…",
            description: "Save the current page to file.",

            keybind: "CmdOrCtrl+S"
        });

        this.tabId = tabId;
    }
}
