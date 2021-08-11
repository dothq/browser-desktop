import { MenuItem } from ".";
import { dot } from "../../api";

export class Delete extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-delete",
            type: "item",
            category: "edit",

            label: "Delete",
            description: "Deletes highlighted text in text field."
        })

        this.tabId = tabId;
    }
}