import React from "react";
import { dot } from "../../api";

export const ToolbarButton = ({
    image,
    children,
    id,
    onClick,
    onMouseDown,
    onMouseUp,
    command,
    className,
    disabled,
    menu,
    menuCtx
}: {
    image?: string
    children?: any
    id?: any
    onClick?: any
    onMouseDown?: any
    onMouseUp?: any
    command?: string
    className?: any
    disabled?: boolean
    menu?: string
    menuCtx?: any
}) => {
    const onTBClick = () => {
        if (command) dot.utilities.doCommand(command);
        if (onClick) onClick();

        if (menu) {
            if (dot.menus.visibleMenu) return dot.menus.clear(true);

            dot.menus.create(
                menu,
                { el: document.getElementById(id) },
                menuCtx || {}
            );
        }
    }

    return (
        <a
            id={id}
            className={`
                toolbar-button
                ${disabled ? `toolbar-button-disabled` : ``}
                ${!!image ? `toolbar-button-has-image` : ``}
                ${className ? className : ``}
            `.trim()}
            onClick={onTBClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        >
            <i className={"toolbarbutton-icon"} style={{ backgroundImage: `url(${image})` }} />

            <label className={"toolbarbutton-text"}>
                {children}
            </label>
        </a>
    )
};