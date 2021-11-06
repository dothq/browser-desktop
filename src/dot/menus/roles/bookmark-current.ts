import { dot } from "../../api";

export const BookmarkCurrentMenuRole = {
    id: "bookmark-current",
    label: "Bookmark current tab",
    accelerator: "CmdOrCtrl+D",
    icon: "chrome://dot/content/skin/icons/bookmark.svg",
    click: () => dot.tabs.selectedTab?.bookmark()
}