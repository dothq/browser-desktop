/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react"
import { dot } from "../../app"
import { ToolbarButton } from "../ToolbarButton"
import { WindowControls } from "../WindowControls";
import { Navbar, NavbarContainer, NavigatorToolbox, Tabbar } from "./style"

export const Chrome = () => {
    React.useEffect(() => {
        console.log("goback", dot.tabs.selectedTab
                        ? dot.tabs.selectedTab.webContents.canGoBack
                        : false)
    }, [false])

    return (
        <NavigatorToolbox id={"navigator-toolbox"}>
            <Navbar id={"navigation-bar"}>
                <NavbarContainer>
                    <ToolbarButton 
                        id={"back-button"}
                        image={"chrome://dot/content/skin/icons/back.svg"}
                        command={"Browser:GoBack"}
                        disabled={dot.tabs.selectedTab?.webContents.canGoBack}
                    />

                    <ToolbarButton 
                        id={"forward-button"}
                        image={"chrome://dot/content/skin/icons/forward.svg"}
                        command={"Browser:GoForward"}
                        disabled={dot.tabs.selectedTab?.webContents.canGoForward}
                    />

                    <ToolbarButton 
                        id={"stop-reload-button"} 
                        image={"chrome://dot/content/skin/icons/reload.svg"}
                        command={"Browser:Reload"} />

                    <ToolbarButton onClick={() => dot.dev.launchBrowserToolbox()}>
                        Launch DevTools
                    </ToolbarButton>

                    <ToolbarButton 
                        id={"loading-button"} 
                        image={"chrome://dot/content/skin/icons/tab/loading.png"}
                        className={"loading-spin-animation"}
                    />
                </NavbarContainer>

                <WindowControls />
            </Navbar>
            <Tabbar id={"tab-bar"}>
                hello
            </Tabbar>
        </NavigatorToolbox>
    )
};