import React, { FC, useEffect, useState } from "react";
import { CheckIcon } from "../check";
import { ControlType } from "../types";

function getType(pref: string): string | void {
    const type = window.dot.prefs.getType(pref);

    if (!type) {
        console.warn(
            `Preference with ID ${pref} does not exist`
        );
        return;
    }

    return type;
}

function typeCheck(type: string, ...values: any[]) {
    for (const value of values) {
        if (typeof value !== type) {
            throw new Error(
                `${value} (type ${typeof value}) doesn't match ${type}`
            );
        }
    }
}

type CheckboxType = FC<{
    type: ControlType;
    pref?: string;
    trueVal?: string | number;
    falseVal?: string | number;
    defaultVal?: boolean;
    onChange?: (val: boolean) => void;
}>;

export const UICheckbox: CheckboxType = ({
    children,
    type,
    pref,
    trueVal,
    falseVal,
    defaultVal,
    onChange
}): JSX.Element => {
    const [value, setValue] = useState(
        defaultVal || false
    );
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        if (type !== ControlType.Preference) return;

        if (!pref)
            throw new Error(
                "No preference ID provided in preference mode"
            );

        const prefType = getType(pref);

        switch (prefType) {
            case "bool":
                setValue(window.dot.prefs.get(pref));
                break;

            case "int":
                typeCheck("number", trueVal, falseVal);
                const val = window.dot.prefs.get(pref);
                const shouldCheck = val == trueVal;
                setValue(shouldCheck);
                break;

            default:
                console.warn(
                    `Preference with ID ${pref} has an unknown type ${prefType}`
                );
                setDisabled(true);
                return;
        }
    }, []);

    function onUpdate() {
        const newValue = !value;

        setValue(newValue);

        if (onChange) {
            onChange(newValue);
        }

        if (type !== ControlType.Preference) return;

        if (!pref)
            throw new Error(
                "No preference ID provided in preference mode"
            );

        const prefType = getType(pref);

        switch (prefType) {
            case "bool":
                window.dot.prefs.set(pref, newValue);
                break;

            case "int":
                if (
                    typeof trueVal !== "number" ||
                    typeof falseVal !== "number"
                )
                    throw new Error(
                        "True and false value must be a number"
                    );
                window.dot.prefs.set(
                    pref,
                    newValue ? trueVal : falseVal
                );
                break;

            default:
                console.warn(
                    `Preference with ID ${pref} has an unknown type ${prefType}`
                );
                setDisabled(true);
                return;
        }
    }

    return (
        <label className="settings-checkbox">
            <input
                type="checkbox"
                checked={value}
                onChange={onUpdate}
            />
            <div>
                <div>
                    <div>{children}</div>
                </div>
            </div>
            <span
                className={`checkmark ${
                    disabled ? "disabled" : ""
                }`}
            >
                <CheckIcon
                    size={10}
                    className={value ? "show" : "hidden"}
                />
            </span>
        </label>
    );
};
