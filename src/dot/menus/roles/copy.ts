import { kCopyIcon } from "../../core/icons";

export const CopyMenuRole = {
    id: "copy",
    label: "Copy",
    icon: kCopyIcon,
    type: "normal",
    accelerator: "CmdOrCtrl+C",
    click: () => {
        document.execCommand("copy");
    }
};
