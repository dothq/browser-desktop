import React, { FC, useEffect, useState } from "react";
import { CheckIcon } from "../check";

function getType(pref: string): string | void {
    const type = window.dot.prefs.getType(pref)

    if (!type) {
        console.warn(`Preference with ID ${pref} does not exist`)
        return
    }

    return type
}

function typeCheck(type: string, ...values: any[]) {
    for (const value of values) {
        if (typeof value !== type) {
            throw new Error(`${value} (type ${typeof value}) doesn't match ${type}`)
        }
    }
}

type CheckboxType = FC<{
    pref: string;
    trueVal?: string | number;
    falseVal?: string | number;
}>;

export const UICheckbox: CheckboxType = ({
    children,
    pref,
    trueVal,
    falseVal
}): JSX.Element => {
    const [value, setValue] = useState(false)
    const [disabled, setDisabled] = useState(false)

    useEffect(() => {
        const type = getType(pref)

        switch (type) {
            case 'bool':
                setValue(window.dot.prefs.get(pref))
                break

            case 'int':
                typeCheck('number', trueVal, falseVal)
                const val = window.dot.prefs.get(pref);
                const shouldCheck = val == trueVal;
                setValue(shouldCheck)
                break

            default:
                console.warn(`Preference with ID ${pref} has an unknown type ${type}`)
                setDisabled(true)
                return
        }
    }, [])

    function onChange() {
        const newValue = !value;

        setValue(newValue)

        const type = getType(pref)

        switch (type) {
            case 'bool':
                window.dot.prefs.set(pref, newValue)
                break

            case 'int':
                if (typeof trueVal !== 'number' || typeof falseVal !== 'number') throw new Error('True and false value must be a number')
                window.dot.prefs.set(pref, newValue ? trueVal : falseVal)
                break

            default:
                console.warn(`Preference with ID ${pref} has an unknown type ${type}`)
                setDisabled(true)
                return
        }
    }

    return (
        <label
            className="settings-checkbox"
        >
            <input
                type="checkbox"
                checked={value}
                onChange={onChange}
            />
            <div>
                <div>
                    <div>{children}</div>
                </div>
            </div>
            <span className={`checkmark ${disabled ? 'disabled' : ''}`}>
                <CheckIcon size={10} className={value ? 'show' : 'hidden'} />
            </span>
        </label>
    );
};
