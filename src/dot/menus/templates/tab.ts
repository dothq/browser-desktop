import { TemplatedMenu } from "..";
import { CloseTab } from "../components/close-tab";
import { CloseTabs } from "../components/close-tabs";
import { CloseTabsToLeft } from "../components/close-tabs-to-left";
import { CloseTabsToRight } from "../components/close-tabs-to-right";
import { DuplicateTab } from "../components/duplicate-tab";
import { MuteTab } from "../components/mute-tab";
import { NewTab } from "../components/new-tab";
import { PinTab } from "../components/pin-tab";
import { ReloadTab } from "../components/reload-tab";
import { ReopenClosedTab } from "../components/reopen-closed-tab";
import { ________________ } from "../components/separator";

export class TabMenu extends TemplatedMenu {
    constructor() {
        super({
            id: "context-tab",
            name: "Tab",
            description: "The menu that appears when right clicking a tab.",

            layoutPref: "dot.menus.tab.layout",
            defaultLayout: [
                NewTab,
                ________________,
                ReloadTab,
                MuteTab,
                PinTab,
                DuplicateTab,
                ________________,
                CloseTab,
                CloseTabs,
                CloseTabsToLeft,
                CloseTabsToRight,
                ________________,
                ReopenClosedTab
            ]
        })
    }
}