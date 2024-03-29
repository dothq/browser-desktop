import { MenuItem } from ".";
import { dot } from "../../api";
import { store } from "../../app/store";
import { Hotkey } from "../hotkey";

export class AddBookmark extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get label() {
        return this.tab?.bookmarked ? "Edit Bookmark…" : "Bookmark"
    }

    public get icon() {
        return this.tab?.bookmarked ? "bookmark-filled.svg" : "actions/new-bookmark.svg"
    }

    public onClick() {
        return store.dispatch({
            type: "TAB_BOOKMARK", payload: {
                id: this.tabId
            }
        })
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-bookmarkpage",
            type: "item",
            category: "page",

            description: "Bookmark the current page.",

            hotkey: new Hotkey("Ctrl", "D")
        })

        this.tabId = tabId;
    }
}