import { Menu } from ".";
import { dot } from "../api";
import { separator } from "./common";

const iconPrefix = "chrome://dot/content/skin/icons/";

export const PageMenu = Menu.buildFromTemplate({
    id: "context-navigation",
    iconPrefix,

    menu: [
        {
            id: "context-back",
            label: "Back",
            icon: "back.svg",

            click: () => {
                dot.utilities.doCommand("Browser:GoBack")
            },

            hotkey: ["Alt", "Left Arrow"]
        },
        {
            id: "context-forward",
            label: "Forward",
            icon: "forward.svg",

            click: () => {
                dot.utilities.doCommand("Browser:GoForward")
            },

            hotkey: ["Alt", "Right Arrow"]
        },
        {
            id: "context-reload",
            label: "Reload",
            icon: "reload.svg",

            click: () => {
                dot.utilities.doCommand("Browser:Reload")
            },

            hotkey: ["Ctrl", "R"]
        },
        {
            id: "context-bookmarkpage",
            label: "Bookmark",
            icon: "actions/new-bookmark.svg",

            click: () => {
                dot.utilities.doCommand("Browser:Bookmark")
            },

            hotkey: ["Ctrl", "D"]
        },
        separator,
        {
            id: "context-savepage",
            label: "Save As…"
        },
        {
            id: "context-print",
            label: "Print…",
            icon: "print.svg"
        },
        {
            id: "context-screenshot",
            label: "Screenshot…",
            icon: "screenshot.svg"
        },
        separator,
        {
            id: "context-viewsource",
            label: "View Page Source",

            hotkey: ["Ctrl", "U"]
        },
        {
            id: "context-inspect",
            label: "Inspect",
            icon: "inspect.svg",

            hotkey: ["Ctrl", "Shift", "I"]
        },
    ]
})