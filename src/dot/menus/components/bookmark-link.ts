import { MenuItem } from ".";
import { dot } from "../../api";

export class BookmarkLink extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-bookmarklink",
            type: "item",
            category: "link",

            label: "Bookmark Link",
            description:
                "Adds the selected link to your bookmarks."
        });

        this.tabId = tabId;
    }
}
