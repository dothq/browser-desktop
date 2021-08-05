import React from "react";
import * as RadioGroup from 'react-radio-group';

export const Radio = ({ id, label, primary, spaced, group, value }: { id: string, label?: string | any, primary?: boolean, spaced?: boolean, group: string, value: string }) => {
    return (
        <a
            className={`dot-ui-radio 
                ${primary ? `is-primary` : ``}
                ${spaced ? `is-spaced` : ``}
            `}
        >
            <RadioGroup.Radio
                className={"dot-ui-radio-input"}
                id={id}
                value={value}
            />

            <label htmlFor={id} className={"dot-ui-radio-label"}>
                {label}
            </label>
        </a>
    )
}