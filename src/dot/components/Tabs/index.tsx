import { observer } from "mobx-react";
import React from "react";
import { dot } from "../../api";
import { ipc } from "../../core/ipc";
import { BrowserTab } from "../Tab";
import { ToolbarButton } from "../ToolbarButton";
import { TabsController } from "./TabsController";

export const Tabs = observer(() => {
    React.useEffect(() => {
        ipc.on("tab-created", () => {
            TabsController.scrollToEnd()
            TabsController.maybeShowScrollerButtons()
        })
        window.addEventListener("resize", () => TabsController.maybeShowScrollerButtons())
    }, [])

    return (
        <>
            <ToolbarButton 
                image={"chrome://dot/content/skin/icons/back.svg"}
                className={"tabs-scroller-button"}
            />

            <div 
                id={"tabbrowser-tabs-scroller"}
                ref={TabsController.tabsScrollerRef}
                onWheel={(e) => TabsController.onTabsScroll(e)}
                onMouseOver={() => TabsController.onTabsMouseOver()}
                onMouseLeave={() => TabsController.onTabsMouseLeave()}
            >
                <div id={"tabbrowser-tabs"}>
                    {dot.tabs.list.map(tab => (
                        <BrowserTab 
                            key={tab.id} 
                            tab={tab} 
                        />
                    ))}
                </div>
            </div>

            <ToolbarButton 
                image={"chrome://dot/content/skin/icons/forward.svg"}
                className={"tabs-scroller-button"}
            />
        </>
    )
});