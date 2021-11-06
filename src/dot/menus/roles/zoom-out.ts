import { dot } from "../../api";

export const ZoomOutMenuRole = {
    id: "zoomout",
    label: "Zoom Out",
    icon: "chrome://dot/content/skin/icons/zoom-out.svg",
    type: "normal",
    accelerator: "CmdOrCtrl+-",
    click: () =>
        dot.tabs.selectedTab?.zoomManager.reduce()
}