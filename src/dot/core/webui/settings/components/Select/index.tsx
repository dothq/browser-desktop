import React, { FC, useEffect, useState } from "react";

const { prefs } = window.dot;

export const UISelect: FC<{
    values: {
        /**
         * The settings key that should be used
         */
        key: string | number;
        /**
         * The text that should be displayed
         */
        name: string;
    }[];
    pref: string;
}> = ({ pref, values }) => {
    const [value, setValue] = useState(values[0].key);

    useEffect(() => {
        if (!pref)
            throw new Error(
                "No preference ID provided in preference mode"
            );

        const prefType = prefs.getType(pref);

        switch (prefType) {
            case "int":
                const val = window.dot.prefs.get(pref);
                setValue(val);
                break;

            case "str":
                const strVal = window.dot.prefs.get(pref);
                setValue(strVal);
                break;

            default:
                console.warn(
                    `Preference with ID ${pref} has an unknown type ${prefType}`
                );
                return;
        }
    }, []);

    function onUpdate(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const newValue = e.target.value;

        setValue(newValue);

        const prefType = prefs.getType(pref);

        switch (prefType) {
            case "int":
                window.dot.prefs.set(
                    pref,
                    parseInt(newValue)
                );
                break;

            case "str":
                window.dot.prefs.set(pref, newValue);
                break;

            default:
                console.warn(
                    `Preference with ID ${pref} has an unknown type ${prefType}`
                );
                return;
        }
    }

    return (
        <select
            onChange={(e) => onUpdate(e)}
            value={value}
        >
            {values.map(({ key, name }) => (
                <option key={key} value={key}>
                    {name}
                </option>
            ))}
        </select>
    );
};
