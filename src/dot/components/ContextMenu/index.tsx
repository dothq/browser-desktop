import React from "react"

export const ContextMenu = ({ id, children }: { id: string, children: any }) => {
    return (
        <menu id={id}>
            {children}
        </menu>
    )
}