import { dot } from "../../api";
import { kCloseIcon } from "../../core/icons";

export const CloseMenuRole = {
    id: "close",
    label: "Quit",
    icon: kCloseIcon,
    type: "normal",
    accelerator: "CmdOrCtrl+Q",
    click: () => {
        dot.window.quit();
    }
};
