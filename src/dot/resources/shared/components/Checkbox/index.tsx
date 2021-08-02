import React from "react"

export const Checkbox = ({ id, label, primary }: { id: string, label?: string, primary?: boolean }) => {
    return (
        <a className={`dot-ui-checkbox ${primary ? `dot-ui-checkbox-primary` : ``}`}>
            <input className={"dot-ui-checkbox-input"} type="checkbox" id={id}></input>

            <label htmlFor={id} className={"dot-ui-checkbox-label"}>
                {label}
            </label>
        </a>
    )
}