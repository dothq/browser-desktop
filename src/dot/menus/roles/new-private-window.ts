import { dot } from "../../api";

export const NewPrivateWindowMenuRole = {
    id: "new-private-window",
    label: "New Private Window",
    accelerator: "CmdOrCtrl+Shift+P",
    type: "normal",
    click: () => dot.window.openNew({ type: "private" })
};
