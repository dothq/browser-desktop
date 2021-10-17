import React from "react";
import { useBrowserSelector } from "../../app/store/hooks";
import { ipc } from "../../core/ipc";
import { BrowserTab } from "../Tab";
import { ToolbarButton } from "../ToolbarButton";
import { TabsController } from "./TabsController";

export const Tabs = () => {
    const tabs = useBrowserSelector(s => s.tabs);

    React.useEffect(() => {
        ipc.on("tab-created", () => TabsController.maybeShowScrollerButtons())
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
                    {tabs.list.map(tab => (
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
}