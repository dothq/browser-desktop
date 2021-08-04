import React from "react";

export const Checkbox = ({ id, label, primary, checked, spaced }: { id: string, label?: string | any, primary?: boolean, checked?: boolean, spaced?: boolean }) => {
    const [isChecked, setChecked] = React.useState(Boolean(checked));

    return (
        <a
            className={`dot-ui-checkbox 
                ${primary ? `is-primary` : ``}
                ${spaced ? `is-spaced` : ``}
            `}
        >
            <input
                className={"dot-ui-checkbox-input"}
                type="checkbox"
                id={id}
                value={isChecked as any}
                onClick={() => {
                    setChecked(!isChecked)
                }}
            ></input>

            <label htmlFor={id} className={"dot-ui-checkbox-label"}>
                {label}
            </label>
        </a>
    )
}