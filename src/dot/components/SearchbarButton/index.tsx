import React from "react";
import { dot } from "../../api";

export const SearchbarButton = ({ id, className, icon, label, command, onClick, selected, title }: { id: any; className?: any; icon?: any, label?: any; command?: string, onClick?: any, selected?: boolean, title?: string }) => {
    const onSearchButtonClick = () => {
        if (command) dot.utilities.doCommand(command);
        if (onClick) onClick();
    }

    return (
        <a
            id={id}
            className={"searchbar-button " + (className || "")}
            onClick={() => onSearchButtonClick()}
            data-selected={selected}
            title={title}
        >
            <i
                className={"searchbar-button-icon"}
                style={{ backgroundImage: icon ? `url(${icon})` : "" }}
            ></i>
            <label className={"searchbar-button-label"}>{label}</label>
        </a>
    )
}