import React from "react";
import { dot } from "../../../../api";

const colours = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "purple",
    "pink",
    "gray"
]

export const AccentColourPicker = () => {
    const [selected, setSelected] = React.useState("");

    dot.prefs.observe(
        "dot.ui.accent_colour",
        (value: string) => {
            if (selected == value) return;
            setSelected(value);
        },
        true
    );

    return (
        <div className={"settings-accent-colour-picker"}>
            {colours.map(colour => (
                <a
                    className={`accent-bubble colour-${colour}`}
                    data-selected={selected == colour}
                    key={colour}
                    href={"#"}
                    onMouseDown={() => dot.prefs.set("dot.ui.accent_colour", colour)}
                ></a>
            ))}
        </div>
    )
}