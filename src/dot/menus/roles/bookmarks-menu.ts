import { kBookmarkIcon } from "../../core/icons";
import { BookmarkCurrentMenuRole } from "./bookmark-current";
import { BookmarksBarToggleMenuRole } from "./bookmarks-bar-toggle";
import { BookmarksManagerMenuRole } from "./bookmarks-manager";

export const BookmarksMenuMenuRole = {
    id: "bookmarksmenu",
    label: "Bookmarks",
    icon: kBookmarkIcon,
    type: "submenu",
    submenu: [
        BookmarkCurrentMenuRole,
        BookmarksManagerMenuRole,
        BookmarksBarToggleMenuRole,
        { type: "separator" }
    ]
};
