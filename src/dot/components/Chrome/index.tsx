/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react"
import { useBrowserDispatch, useBrowserSelector } from "../../app/store/hooks"
import { Tab } from "../../models/Tab"
import { NewTabButton } from "../NewTabButton"
import { Searchbar } from "../Searchbar"
import { Spring } from "../Spring"
import { BrowserTab } from "../Tab"
import { Tabs } from "../Tabs"
import { ToolbarButton } from "../ToolbarButton"
import { WindowControls } from "../WindowControls"

export const Chrome = () => {
    const ui = useBrowserSelector((s: any) => s.ui)
    const tabs = useBrowserSelector((s: any) => s.tabs)
    const dispatch = useBrowserDispatch()

    return (
        <div id={"navigator-toolbox"}>
            <nav id={"navigation-bar"}>
                <div id={"navigation-bar-container"}>
                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/back.svg"}
                        disabled={tabs.selectedTab?.canGoBack}
                        command={"Browser:GoBack"}
                    />

                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/forward.svg"}
                        disabled={tabs.selectedTab?.canGoForward}
                        command={"Browser:GoForward"}
                    />

                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/reload.svg"}
                    />

                    <NewTabButton variant={"navigation-bar"} />

                    <Spring />
                    <Searchbar />
                    <Spring />

                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/inspect.svg"}
                        command={"Browser:LaunchBrowserToolbox"}
                    />

                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/settings.svg"}
                        onClick={() => dispatch({ type: "TAB_CREATE_INTERNAL", payload: { id: "settings" } })}
                    />

                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/more.svg"}
                    />
                </div>
                <WindowControls />
            </nav>
            <nav id={"tab-bar"}>
                <Tabs>
                    {tabs.list.map((tab: Tab, index: number) => (
                        <BrowserTab
                            key={tab.id}
                            tab={tab}
                            nextIsActive={tabs.list[index + 1]
                                ? tabs.list[index + 1].active
                                : false
                            }
                        />
                    ))}
                </Tabs>

                <NewTabButton variant={"tab-bar"} />
            </nav>
        </div>
    )
}