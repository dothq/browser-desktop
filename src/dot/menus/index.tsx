import React from "react"
import { ContextMenu } from "../components/ContextMenu"
import { ContextMenuItem } from "../components/ContextMenuItem"

export type MenuType = 'normal' | 'separator' | 'checkbox' | 'radio'

// Translations between macOS -> other OSes
//    - Ctrl <-> Cmd
//    - Shift <-> Option
//    - Alt <-> Control
//    - Super <-> Cmd
export type MenuHotkey = 'Ctrl' |
    'Shift' |
    'Alt' |
    'Super' |
    string

export interface MenuItem {
    id?: string,

    label?: string,
    icon?: string,
    iconColour?: string,
    hotkey?: MenuHotkey[],
    type?: MenuType,

    visible?: boolean,
    disabled?: boolean,

    click?: (...args: any[]) => void,
    hover?: (...args: any[]) => void,

    submenu?: MenuItem[]
}

export class Menu {
    static buildFromTemplate(template: {
        id: string,
        menu: MenuItem[],
        iconPrefix?: string
    }) {
        const M = () => (
            <ContextMenu id={template.id} key={template.id}>
                {template.menu.map((menuitem, index) => (
                    <ContextMenuItem
                        {...menuitem}
                        key={menuitem.id || `${menuitem.type || "normal"}-${index}`}
                        icon={template.iconPrefix
                            ? `${template.iconPrefix}${menuitem.icon}`
                            : menuitem.icon
                        }
                    />
                ))}
            </ContextMenu>
        )

        return M;
    }
}