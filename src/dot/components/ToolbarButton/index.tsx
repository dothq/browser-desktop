import { observer } from "mobx-react-lite";
import React from "react";
import { dot } from "../../api";

export const ToolbarButton = observer(({
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
    menuCtx,
    title
}: {
    image?: string;
    children?: any;
    id?: any;
    onClick?: (e: MouseEvent) => void;
    onMouseDown?: (e: MouseEvent) => void;
    onMouseUp?: (e: MouseEvent) => void;
    command?: string;
    className?: any;
    disabled?: boolean;
    menu?: string;
    menuCtx?: any;
    title?: string;
}) => {
    const onTBClick = (e: MouseEvent) => {
        if (command) dot.utilities.doCommand(command);
        if (onClick) onClick(e);
    };

    const onTBMouseDown = (e: MouseEvent) => {
        if (onMouseDown) onMouseDown(e);
    };

    const onTBMouseUp = (e: MouseEvent) => {
        if (onMouseUp) onMouseUp(e);

        if (menu) {
            dot.menus.create(
                menu,
                { el: document.getElementById(id) },
                menuCtx || {}
            );
        }
    };

    return (
        <a
            id={id}
            className={`
                toolbar-button
                ${
                    disabled
                        ? `toolbar-button-disabled`
                        : ``
                }
                ${
                    !!image
                        ? `toolbar-button-has-image`
                        : ``
                }
                ${className ? className : ``}
            `.trim()}
            onClick={
                disabled ? () => {} : (onTBClick as any)
            }
            onMouseDown={
                disabled
                    ? () => {}
                    : (onTBMouseDown as any)
            }
            onMouseUp={
                disabled ? () => {} : (onTBMouseUp as any)
            }
            title={title}
        >
            <i
                className={"toolbarbutton-icon"}
                style={{
                    backgroundImage: `url(${image})`
                }}
            />

            <label className={"toolbarbutton-text"}>
                {children}
            </label>
        </a>
    );
});