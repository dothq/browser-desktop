import React from "react"
import { SearchbarButton } from "../SearchbarButton"

const labels: any = {
    "built-in": "Dot Browser"
}

export const Identity = ({ type }: {
    type: 'search' |
    'info' |
    'warning' |
    'built-in' |
    'http' |
    'https' |
    'https-unsecure' |
    'extension' |
    'file'
}) => {
    return (
        <SearchbarButton
            id={"identity-icon-box"}
            className={type}
            label={labels[type] ? labels[type] : ""}
        />
    )
}