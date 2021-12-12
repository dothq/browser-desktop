import { dot } from "../../api";
import { kReloadIcon } from "../../core/icons";

export const ReloadMenuRole = {
    id: "reload",
    label: "Reload",
    icon: kReloadIcon,
    accelerator: "CmdOrCtrl+R",
    type: "normal",
    click: () => dot.tabs.selectedTab?.reload()
};
