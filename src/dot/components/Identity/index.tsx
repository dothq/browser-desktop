import React from "react"
import { SearchbarButton } from "../SearchbarButton"

const labels: any = {
    "built-in": "Dot Browser"
}

export const Identity = ({ type, onClick, selected }: {
    type: 'search' |
    'info' |
    'warning' |
    'built-in' |
    'http' |
    'https' |
    'https-unsecure' |
    'extension' |
    'file',
    onClick?: any
    selected?: boolean
}) => {
    return (
        <SearchbarButton
            id={"identity-icon-box"}
            className={type}
            label={labels[type] ? labels[type] : ""}
            onClick={onClick}
            selected={selected}
        />
    )
}