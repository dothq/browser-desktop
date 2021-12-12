import { dot } from "../../api";
import { kNewWindowIcon } from "../../core/icons";

export const NewWindowMenuRole = {
    id: "new-window",
    label: "New Window",
    icon: kNewWindowIcon,
    accelerator: "CmdOrCtrl+N",
    type: "normal",
    click: () => dot.window.openNew({ type: "normal" })
};
