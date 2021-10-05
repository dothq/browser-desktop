import React from "react";
import { UICheckbox } from "../../../components/Checkbox";
import { ColorSelector } from "../../../components/ColorSelector";
import { ImageSelector } from "../../../components/ImageSelector";
import { ControlType } from "../../../components/types";
import { Layouts } from "../../layouts";

export const Theme = () => {
    const themeKeys = Array.from(
        window.dot.theme.themes.keys()
    );
    const themes: {
        key: string;
        image: string;
        description: string;
    }[] = themeKeys
        .map((key) => ({
            key: window.dot.theme.themes.get(key)?.id,
            image: window.dot.theme.themes.get(key)
                ?.iconURL,
            description:
                window.dot.theme.themes.get(key)?.name
        }))
        .filter(
            (theme) =>
                typeof theme.key !== "undefined" &&
                typeof theme.image !== "undefined" &&
                typeof theme.description !== "undefined"
        ) as unknown as {
        key: string;
        image: string;
        description: string;
    }[];

    return (
        <>
            {/* TODO: Replace divs with cards */}
            <div>
                <ImageSelector
                    values={themes}
                    defaultKey={
                        window.dot.theme.currentThemeId
                    }
                    onChange={(key) =>
                        window.dot.theme.load(key)
                    }
                >
                    <a
                        className="more-themes-selector"
                        href="https://addons.mozilla.org/en-US/firefox/"
                    >
                        Find more themes in the theme
                        store
                    </a>
                </ImageSelector>

                <ColorSelector
                    defaultColour={
                        window.dot.theme.accentColour
                    }
                />

                <h2>Apply this theme to</h2>
                <UICheckbox
                    type={ControlType.Loose}
                    defaultVal={true}
                >
                    Reader mode (TODO)
                </UICheckbox>
                <UICheckbox
                    type={ControlType.Loose}
                    defaultVal={true}
                >
                    Developer tools (TODO)
                </UICheckbox>
                <UICheckbox
                    type={ControlType.Loose}
                    defaultVal={true}
                >
                    Private browsing mode (TODO)
                </UICheckbox>
            </div>

            {/* TODO: Ship theme scheduling. Not a part of the first release */}

            <div>
                <Layouts.Switch
                    text={"Show menu bar"}
                    description={
                        "Makes the menu bar visible at all times."
                    }
                    pref={"dot.menubar.visible"}
                />

                {/* TODO: Indent */}
                <UICheckbox
                    type={ControlType.Preference}
                    pref="dot.menubar.icon"
                >
                    Show Dot Browser icon in the status
                    bar
                </UICheckbox>

                {/* <h2>Status bar [TODO]</h2> Later release*/}

                {/* Bookmarks will be implemented after release 1 */}
                <Layouts.Select
                    text={"Show bookmarks bar"}
                    pref={"dot.bookmark.bar.visible"}
                    values={[
                        { key: "never", name: "Never" },
                        { key: "ntp", name: "New Tab" },
                        { key: "always", name: "Always" }
                    ]}
                />

                {/* TODO: Window controls side */}

                <Layouts.Switch
                    text={"Use native titlebar"}
                    pref={"dot.titlebar.native"}
                />

                {/* TODO: Interface scale comes later */}
            </div>

            {/* TODO: Sidebar. To come after first release */}

            {/* TODO: Customizing tab position, to come after the first release */}
        </>
    );
};
