import { MenuItem } from ".";
import { dot } from "../../api";

export class Reload extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public onClick() {
        return this.tab?.reload();
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "reload",
            type: "item",
            category: "page",

            label: "Reload",
            icon: "reload.svg",
            description: "Reload the current page.",

            keybind: "CmdOrCtrl+R"
        });

        this.tabId = tabId;
    }
}
