import { MenuItem } from ".";
import { dot } from "../../api";

export class InspectElement extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "inspect",
            type: "item",
            category: "development",

            label: "Inspect",
            icon: "inspect.svg",
            description:
                "Open the DevTools for the current page.",

            keybind: "CmdOrCtrl+Shift+I"
        });

        this.tabId = tabId;
    }
}
