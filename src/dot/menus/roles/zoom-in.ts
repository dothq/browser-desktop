import { dot } from "../../api";

export const ZoomInMenuRole = {
    id: "zoomin",
    label: "Zoom In",
    icon: "chrome://dot/content/skin/icons/zoom-in.svg",
    type: "normal",
    accelerator: "CmdOrCtrl+=",
    click: () =>
        dot.tabs.selectedTab?.zoomManager.enlarge()
};
