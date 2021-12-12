import { kCutIcon } from "../../core/icons";

export const CutMenuRole = {
    id: "cut",
    label: "Cut",
    icon: kCutIcon,
    type: "normal",
    accelerator: "CmdOrCtrl+X",
    click: () => {
        document.execCommand("cut");
    }
};
