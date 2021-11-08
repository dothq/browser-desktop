import { dot } from "../../api";

export const NewWindowMenuRole = {
    id: "new-window",
    label: "New Window",
    icon: "chrome://dot/content/skin/icons/new-window.svg",
    accelerator: "CmdOrCtrl+N",
    type: "normal",
    click: () => dot.window.openNew({ type: "normal" })
};
