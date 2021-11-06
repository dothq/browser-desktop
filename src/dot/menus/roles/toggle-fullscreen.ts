import { dot } from "../../api";

export const ToggleFullscreenMenuRole = {
    id: "togglefullscreen",
    label: "Toggle Fullscreen",
    icon: "chrome://dot/content/skin/icons/fullscreen.svg",
    type: "normal",
    click: () =>
        dot.tabs.selectedTab?.webContents.requestFullscreen()
}