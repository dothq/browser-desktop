import { Menu } from ".";

const iconPrefix = "chrome://dot/content/skin/icons/";

export const PageMenu = Menu.buildFromTemplate({
    id: "context-navigation",
    iconPrefix,

    menu: [
        {
            id: "context-back",
            label: "Back",
            icon: "back.svg",

            hotkey: ["Alt", "Left Arrow"]
        },
        {
            id: "context-forward",
            label: "Forward",
            icon: "forward.svg",

            hotkey: ["Alt", "Right Arrow"]
        },
        {
            id: "context-reload",
            label: "Reload",
            icon: "reload.svg",

            hotkey: ["Ctrl", "R"]
        },
        {
            id: "context-bookmarkpage",
            label: "Bookmark",
            icon: "bookmark.svg",

            hotkey: ["Ctrl", "D"]
        }
    ]
})