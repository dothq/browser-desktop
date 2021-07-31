import React from "react";
import { dot } from "../../api";
import { MenuItem } from "../../menus";

export const ContextMenuItem = ({
    id,
    label,
    icon,
    hotkey,
    hover,
    click,
    disabled,
    visible,
    type
}: MenuItem) => {
    if (type == "separator") return <hr className={"contextmenu-separator"}></hr>;

    const onClick = () => {
        if (click) click();
        dot.menus.clear(true);
    }

    return (
        <div
            className={"contextmenu-item"}
            id={id}
            onMouseOver={hover}
            onClick={onClick}
            data-disabled={disabled}
            data-visible={visible}
        >
            <i
                className={"contextmenu-item-icon"}
                style={{
                    backgroundImage: icon ? `url(${icon})` : ``
                }}
            ></i>

            <label className={"contextmenu-item-label"}>
                {label}
            </label>

            {hotkey && <label className={"contextmenu-item-keybind"}>
                {hotkey.join("+")}
            </label>}
        </div>
    )
}