import { dot } from "../../api";
import { Ci } from "../../modules";

export const ForceReloadMenuRole = {
    id: "forcereload",
    label: "Force Reload",
    type: "normal",
    accelerator: "CmdOrCtrl+Shift+R",
    click: () =>
        dot.tabs.selectedTab?.reload(
            Ci.nsIWebNavigation
                .LOAD_FLAGS_BYPASS_CACHE
        )
}