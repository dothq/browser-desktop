import { dot } from "../../api";

export const NewTabMenuRole = {
    id: "new-tab",
    label: "New Tab",
    icon: "chrome://dot/content/skin/icons/add.svg",
    accelerator: "CmdOrCtrl+T",
    type: "normal",
    click: () => dot.utilities.doCommand("Browser:NewTab")
};
