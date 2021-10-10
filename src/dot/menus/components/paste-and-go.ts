import { MenuItem } from ".";
import { dot } from "../../api";

export class PasteAndGo extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-pasteandgo",
            type: "item",
            category: "edit",

            label: "Paste and Go",
            description:
                "Pastes copied text to text field and executes action."
        });

        this.tabId = tabId;
    }
}
