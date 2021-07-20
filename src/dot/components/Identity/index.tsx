import React from "react"

export const Identity = ({ type }: {
    type: 'search' |
        'info' |
        'warning' |
        'built-in' |
        'http' |
        'https' |
        'https-unsecure' |
        'file'
}) => {
    return (
        <span id={"identity-box"} className={type}>
            <i className={"identity-icon"}></i>
            <label className={"identity-label"}></label>
        </span>
    )
}