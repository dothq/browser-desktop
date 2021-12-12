import React from "react";
import { dot } from "../../api";
import { Spring } from "../../components/Spring";
import { ToolbarButton } from "../../components/ToolbarButton";
import { WindowControls } from "../../components/WindowControls";
import { kBackIcon, kCloseIcon, kForwardIcon, kInspectIcon, kMoreIcon, kReloadIcon, kSettingsIcon } from "../icons";
import { Urlbar } from "../urlbar";

export class Titlebar extends React.Component {
    public render() {
        return (
            <nav id={"navigation-bar"}>
                <div id={"navigation-bar-container"}>
                    <ToolbarButton
                        image={kBackIcon}
                        disabled={
                            !dot.tabs.selectedTab
                                ?.canGoBack
                        }
                        command={"Browser:GoBack"}
                    />

                    <ToolbarButton
                        image={kForwardIcon}
                        disabled={
                            !dot.tabs.selectedTab
                                ?.canGoForward
                        }
                        command={
                            "Browser:GoForward"
                        }
                    />

                    <ToolbarButton
                        image={
                            dot.tabs.selectedTab
                                ?.state ==
                                "loading" &&
                            !dot.tabs.selectedTab
                                ?.identityManager
                                .isAboutUI
                                ? kCloseIcon
                                : kReloadIcon
                        }
                        command={
                            dot.tabs.selectedTab
                                ?.state ==
                                "idle" ||
                            dot.tabs.selectedTab
                                ?.identityManager
                                .isAboutUI
                                ? "Browser:Reload"
                                : "Browser:Stop"
                        }
                    />

                    <Spring />
                    <Urlbar
                        tab={dot.tabs.selectedTab as any}
                    />
                    <Spring />

                    <ToolbarButton
                        image={
                            kInspectIcon
                        }
                        command={
                            "Browser:LaunchBrowserToolbox"
                        }
                    />

                    <ToolbarButton
                        image={
                            kSettingsIcon
                        }
                        command={
                            "Browser:OpenPreferences"
                        }
                    />

                    <ToolbarButton
                        id={"application-menu-button"}
                        image={
                            kMoreIcon
                        }
                        menu={"AppMenu"}
                    />
                </div>
                <WindowControls />
            </nav>
        )
    }
}