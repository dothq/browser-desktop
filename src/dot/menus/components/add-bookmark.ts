import { MenuItem } from ".";
import { dot } from "../../api";

export class AddBookmark extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get label() {
        return this.tab?.bookmarked
            ? "Edit Bookmark…"
            : "Bookmark";
    }

    public get icon() {
        return this.tab?.bookmarked
            ? "bookmark-filled.svg"
            : "actions/new-bookmark.svg";
    }

    public onClick() {}

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "bookmarkpage",
            type: "item",
            category: "page",

            description: "Bookmark the current page.",

            keybind: "CmdOrCtrl+D"
        });

        this.tabId = tabId;
    }
}
