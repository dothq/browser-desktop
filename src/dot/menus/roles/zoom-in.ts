import { dot } from "../../api";
import { kZoomInIcon } from "../../core/icons";

export const ZoomInMenuRole = {
    id: "zoomin",
    label: "Zoom In",
    icon: kZoomInIcon,
    type: "normal",
    accelerator: "CmdOrCtrl+=",
    click: () =>
        dot.tabs.selectedTab?.zoomManager.enlarge()
};
