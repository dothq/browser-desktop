import React from "react"
import { SearchbarButton } from "../SearchbarButton"

const labels: any = {
    "built-in": "Dot Browser"
}

export const Identity = ({ type, onClick, selected, title }: {
    type: string,
    onClick?: any,
    selected?: boolean,
    title?: string
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