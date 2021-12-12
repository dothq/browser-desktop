import { dot } from "../../api";
import { kAddIcon } from "../../core/icons";

export const NewTabMenuRole = {
    id: "new-tab",
    label: "New Tab",
    icon: kAddIcon,
    accelerator: "CmdOrCtrl+T",
    type: "normal",
    click: () => dot.utilities.doCommand("Browser:NewTab")
};
