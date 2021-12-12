import { dot } from "../../api";
import { kFullscreenIcon } from "../../core/icons";

export const ToggleFullscreenMenuRole = {
    id: "togglefullscreen",
    label: "Toggle Fullscreen",
    icon: kFullscreenIcon,
    type: "normal",
    click: () =>
        dot.tabs.selectedTab?.webContents.requestFullscreen()
};
