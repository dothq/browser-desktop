import React from "react"
import { PageContextMenu } from "./page"

export interface ContextMenuProps {
    id: string
}

export const ContextMenus = () => {
    return (
        <>
            <PageContextMenu />
        </>
    )
}