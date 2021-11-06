import { openTrustedLinkIn } from "../../utils/browser";

export const BookmarksManagerMenuRole = {
    id: "bookmarks-manager",
    label: "See all bookmarks…",
    icon: "chrome://dot/content/skin/icons/bookmark.svg",
    accelerator: "CmdOrCtrl+B",
    type: "normal",
    click: () => openTrustedLinkIn("about:bookmarks", "tab")
}