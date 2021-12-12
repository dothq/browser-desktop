import { dot } from "../../api";
import { kBookmarkIcon } from "../../core/icons";

export const BookmarkCurrentMenuRole = {
    id: "bookmark-current",
    label: "Bookmark current tab",
    accelerator: "CmdOrCtrl+D",
    icon: kBookmarkIcon,
    click: () => dot.tabs.selectedTab?.bookmark()
};
