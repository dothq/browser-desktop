import React from "react"
import { ContextMenuProps } from "../../menus"

export const ContextMenu = ({ id, children }: ContextMenuProps & { children: any }) => {
    return (
        <menu id={id}>
            {children}
        </menu>
    )
}