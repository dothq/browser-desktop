import React from "react";
import { MenuItem } from "../../menus";

export const ContextMenuItem = ({
    id,
    label,
    icon
}: MenuItem) => {
    return (
        <div className={"contextmenu-item"} id={id}>
            <i
                className={"contextmenu-item-icon"}
                style={{
                    backgroundImage: icon ? `url(${icon})` : ``
                }}
            ></i>

            <label className={"contextmenu-item-label"}>
                {label}
            </label>
        </div>
    )
}