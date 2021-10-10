import { MenuItem } from ".";
import { dot } from "../../api";

export class CheckSpelling extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-spellcheck",
            type: "item",
            category: "text",

            label: "Check Spelling…",
            description:
                "Checks the spelling in a text field and highlights any mistakes."
        });

        this.tabId = tabId;
    }
}
