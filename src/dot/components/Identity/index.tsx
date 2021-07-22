import React from "react"
import { SearchbarButton } from "../SearchbarButton"

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
        <SearchbarButton id={"identity-icon-box"} className={type} />
    )
}