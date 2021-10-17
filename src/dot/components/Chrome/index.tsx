/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";
import { RootState } from "../../app/store";
import { useBrowserSelector } from "../../app/store/hooks";
import { L } from "../../core/l10n/react";
import { openMenuAt } from "../../shared/menu";
import { NewTabButton } from "../NewTabButton";
import { Searchbar } from "../Searchbar";
import { Spring } from "../Spring";
import { Tabs } from "../Tabs";
import { ToolbarButton } from "../ToolbarButton";
import { WindowControls } from "../WindowControls";

export const Chrome = () => {
    const tabs = useBrowserSelector((s: RootState) => s.tabs);

    return (
        <div
            id={"navigator-toolbox"}
            onContextMenu={(e) =>
                openMenuAt({
                    name: "WindowMenu",
                    bounds: [e.clientX, e.clientY],
                    ctx: {}
                })
            }
        >
            <nav id={"navigation-bar"}>
                <div id={"navigation-bar-container"}>
                    <L id={"navigation-back-button"}>
                        <ToolbarButton
                            image={
                                "chrome://dot/content/skin/icons/back.svg"
                            }
                            disabled={
                                !tabs.getTabById(
                                    tabs.selectedId
                                )?.canGoBack
                            }
                            command={"Browser:GoBack"}
                        />
                    </L>

                    <L id={"navigation-forward-button"}>
                        <ToolbarButton
                            image={
                                "chrome://dot/content/skin/icons/forward.svg"
                            }
                            disabled={
                                !tabs.getTabById(
                                    tabs.selectedId
                                )?.canGoForward
                            }
                            command={"Browser:GoForward"}
                        />
                    </L>

                    <L id={"navigation-reload-button"}>
                        <ToolbarButton
                            image={
                                tabs.getTabById(
                                    tabs.selectedId
                                )?.state == "loading" &&
                                !tabs.getTabById(
                                    tabs.selectedId
                                )?.identityManager
                                    .isAboutUI
                                    ? "chrome://dot/content/skin/icons/close.svg"
                                    : "chrome://dot/content/skin/icons/reload.svg"
                            }
                            command={
                                tabs.getTabById(
                                    tabs.selectedId
                                )?.state == "idle" ||
                                tabs.getTabById(
                                    tabs.selectedId
                                )?.identityManager
                                    .isAboutUI
                                    ? "Browser:Reload"
                                    : "Browser:Stop"
                            }
                        />
                    </L>

                    <Spring />
                    <Searchbar tabId={tabs.selectedId} />
                    <Spring />

                    <ToolbarButton
                        image={
                            "chrome://dot/content/skin/icons/inspect.svg"
                        }
                        command={
                            "Browser:LaunchBrowserToolbox"
                        }
                    />

                    <ToolbarButton
                        image={
                            "chrome://dot/content/skin/icons/settings.svg"
                        }
                        command={
                            "Browser:OpenPreferences"
                        }
                    />

                    <ToolbarButton
                        id={"application-menu-button"}
                        image={
                            "chrome://dot/content/skin/icons/more.svg"
                        }
                        menu={"AppMenu"}
                    />
                </div>
                <WindowControls />
            </nav>
            <nav id={"tab-bar"}>
                <Tabs />

                <NewTabButton />
            </nav>
        </div>
    );
};
