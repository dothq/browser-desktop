import React from "react";
import { dot } from "../../../../api";
import { ThemePickerStorePromo } from "../ThemePickerStorePromo";

export const ThemePicker = () => {
    const [themes, setThemes] = React.useState([]);
    const [selected, setSelected] = React.useState("");
    const [generation, setGeneration] = React.useState(0);

    React.useEffect(() => {
        setSelected(dot.settings.currentThemeId);

        setThemes(
            dot.settings.getThemes()
        );
    }, [generation]);

    const newTheme = async () => {
        await dot.settings.createNewTheme();
        setGeneration(generation + 2);
    }

    return (
        <div className={"settings-themepicker"}>
            {themes.map((theme: any) => (
                <a
                    key={theme.id}
                    className={"settings-themepicker-item"}
                    data-selected={selected == theme.id}
                    onClick={() => {
                        dot.theme.load(theme.id);
                        setSelected(theme.id);
                    }}
                >
                    <i
                        className={"settings-themepicker-item-image"}
                        style={{
                            backgroundImage: theme.iconURL ? `url(${theme.iconURL})` : ``
                        }}
                    ></i>

                    <label className={"settings-themepicker-item-label"}>
                        {theme.name || "Untitled"}
                    </label>
                </a>
            ))}

            <a className={"settings-themepicker-item"} onClick={async () => await newTheme()}>
                <i className={"settings-themepicker-item-image add-theme"}></i>

                <label className={"settings-themepicker-item-label"}>
                    New theme
                </label>
            </a>

            {themes.length <= 3 && <ThemePickerStorePromo />}
        </div>
    )
}