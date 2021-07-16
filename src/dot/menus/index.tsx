import { JSXElement } from "solid-js"
import { MountableElement, Portal } from "solid-js/web"
import { dot } from "../api"
import { ContextMenu } from "../components/ContextMenu"
import { PageContextMenu } from "./page"

export interface ContextMenuProps {
    id: string,
    element?: HTMLElement
}

export const loadContextMenu = (Component: JSXElement, data: ContextMenuProps) => {
    const HOC = () => {
        Object.defineProperty(data, 'element', {
            get: () => { return document.getElementById(data.id) }
        });
        
        dot.menu.register(data);

        return (
            <ContextMenu {...data}>
                {Component}
            </ContextMenu>
        )
    }

    return HOC;
}

export const ContextMenus = () => {
    return (
        <Portal mount={document.getElementById("mainPopupSet") as MountableElement}>
            <PageContextMenu />
        </Portal>
    )
}