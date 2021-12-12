import { dot } from "../../api";
import { kZoomOutIcon } from "../../core/icons";

export const ZoomOutMenuRole = {
    id: "zoomout",
    label: "Zoom Out",
    icon: kZoomOutIcon,
    type: "normal",
    accelerator: "CmdOrCtrl+-",
    click: () =>
        dot.tabs.selectedTab?.zoomManager.reduce()
};
