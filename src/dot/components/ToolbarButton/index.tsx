import React from "react"
import { dot } from "../../app";
import { ToolbarButtonEnclave, ToolbarButtonIcon, ToolbarButtonLabel } from "./style"

export const ToolbarButton = ({
    image,
    children,
    id,
    onClick,
    command,
    className,
    disabled
}: {
    image?: string | { src: any, size: number, colour: any }
    children?: any
    id?: any
    onClick?: any
    command?: string
    className?: any
    disabled?: boolean
}) => {
    if(image && typeof(image) == "object") {
        if(!image.size) image.size = 16;
        if(!image.colour) image.colour = "var(--toolbarbutton-icon-fill)";
    }

    return (
        <ToolbarButtonEnclave 
            id={id} 
            className={className ? `toolbar-button ${className}` : `toolbar-button` + disabled ? `disabled` : ``} 
            hasImage={!!image}
            onClick={command ? () => dot.utilities.doCommand(command) : onClick}
            noHover={!command && !onClick}
            disabled={disabled}
        >
            <ToolbarButtonIcon className={"toolbarbutton-icon"} icon={image} />

            <ToolbarButtonLabel className={"toolbarbutton-text"}>
                {children}
            </ToolbarButtonLabel>
        </ToolbarButtonEnclave>
    )
};