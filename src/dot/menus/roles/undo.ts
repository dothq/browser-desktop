import { kUndoIcon } from "../../core/icons";

export const UndoMenuRole = {
    id: "undo",
    label: "Undo",
    icon: kUndoIcon,
    type: "normal",
    accelerator: "CmdOrCtrl+Z",
    click: () => document.execCommand("undo")
};
