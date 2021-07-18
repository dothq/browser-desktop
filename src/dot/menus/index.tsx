import { MountableElement, Portal } from "solid-js/web"
import { PageContextMenu } from "./page"

export interface ContextMenuProps {
    id: string
}

export const ContextMenus = () => {
    return (
        <Portal mount={document.getElementById("mainPopupSet") as MountableElement}>
            <PageContextMenu />
        </Portal>
    )
}