import React from "react"
import { dot } from "../../api"

export const SearchbarButton = ({ id, className, icon, label, command, onClick }: { id: any; className?: any; icon?: any, label?: any; command?: string, onClick?: any }) => {
    return (
        <a
            id={id}
            className={"searchbar-button " + (className || "")}
            onClick={() => command ? dot.utilities.doCommand(command) : onClick}
        >
            <i
                className={"searchbar-button-icon"}
                style={{ backgroundImage: icon ? `url(${icon})` : "" }}
            ></i>
            <label className={"searchbar-button-label"}>{label}</label>
        </a>
    )
}