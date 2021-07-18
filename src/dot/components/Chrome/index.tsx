/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Searchbar } from "../Searchbar"
import { Spring } from "../Spring"
import { BrowserTab } from "../Tab"
import { Tabs } from "../Tabs"
import { ToolbarButton } from "../ToolbarButton"
import { WindowControls } from "../WindowControls"

export const Chrome = () => {
    return (
        <div id={"navigator-toolbox"}>
            <nav id={"navigation-bar"}>
                <div id={"navigation-bar-container"}>
                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/back.svg"}
                    />

                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/forward.svg"}
                        disabled={true}
                    />

                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/reload.svg"}
                    />

                    <Spring />
                    <Searchbar />
                    <Spring />

                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/inspect.svg"}
                        command={"Browser:LaunchBrowserToolbox"}
                    />

                    <ToolbarButton
                        image={"chrome://dot/content/skin/icons/more.svg"}
                    />
                </div>
                <WindowControls />
            </nav>
            <nav id={"tab-bar"}>
                <Tabs>
                    <BrowserTab active />
                    <BrowserTab />
                </Tabs>
                
                <ToolbarButton
                    id={"new-tab-button"}
                    image={"chrome://dot/content/skin/icons/add.svg"}
                />
            </nav>
        </div>
    )
}