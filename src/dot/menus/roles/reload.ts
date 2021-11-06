import { dot } from "../../api";

export const ReloadMenuRole = {
    id: "reload",
    label: "Reload",
    icon: "chrome://dot/content/skin/icons/reload.svg",
    accelerator: "CmdOrCtrl+R",
    type: "normal",
    click: () =>
        dot.tabs.selectedTab?.reload()
}