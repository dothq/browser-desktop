import React from "react";
import { UICheckbox } from "../../../components/Checkbox";
import { ColorSelector } from "../../../components/ColorSelector";
import { ImageSelector } from "../../../components/ImageSelector";
import { ControlType } from "../../../components/types";

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
                    Find more themes in the theme store
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
        </>
    );
};
