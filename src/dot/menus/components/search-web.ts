import { MenuItem } from ".";
import { trunc } from "..";
import { dot } from "../../api";

export class SearchWebFor extends MenuItem {
    public tabId: number;
    public highlightedText: string;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get label() {
        // todo(l10n): we should replace "the web" with the user's search engine
        return `Search the web for "${trunc(
            this.highlightedText,
            24
        )}"`;
    }

    constructor({
        tabId,
        highlightedText
    }: {
        tabId: number;
        highlightedText: string;
    }) {
        super({
            id: "searchweb",
            type: "item",
            category: "text",

            description:
                "Look up highlighted text using your default search engine."
        });

        this.tabId = tabId;
        this.highlightedText = highlightedText;
    }
}
