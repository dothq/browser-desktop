import { MenuItem } from ".";
import { dot } from "../../api";

export class ReloadTab extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public onClick() {
        this.tab?.reload();
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "reloadtab",
            type: "item",
            category: "page",

            label: "Reload Tab",
            icon: "reload.svg",
            description: "Reload the current tab.",

            keybind: "CmdOrCtrl+R"
        });

        this.tabId = tabId;
    }
}
