import { dot } from "../../api";

export const CloseMenuRole = {
    id: "close",
    label: "Quit",
    icon: "chrome://dot/content/skin/icons/close.svg",
    type: "normal",
    accelerator: "CmdOrCtrl+Q",
    click: () => {
        dot.window.quit();
    }
};
