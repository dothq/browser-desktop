import { kBookmarkIcon } from "../../core/icons";
import { openTrustedLinkIn } from "../../utils/browser";

export const BookmarksManagerMenuRole = {
    id: "bookmarks-manager",
    label: "See all bookmarks…",
    icon: kBookmarkIcon,
    accelerator: "CmdOrCtrl+B",
    type: "normal",
    click: () =>
        openTrustedLinkIn("about:bookmarks", "tab")
};
