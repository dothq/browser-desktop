import { dot } from ".";
import { MenuItem } from "../menus";

interface MenuRect {
    x: number
    y: number
}

export class MenusAPI {
    public visibleMenu: string | undefined;

    public open(id: string, bounds: MenuRect) {
        const menu = this.get(id);

        menu.style.setProperty(
            "--menu-x",
            bounds.x.toString() + "px"
        );

        menu.style.setProperty(
            "--menu-y",
            bounds.y.toString() + "px"
        );

        menu.setAttribute("open", "true");

        this.visibleMenu = id;
    }

    public clear(force?: boolean) {
        if (!this.visibleMenu || !dot.utilities.canPopupAutohide && !force) return;

        const menu = document.getElementById(this.visibleMenu);

        if (menu) {
            menu.style.setProperty(
                "--menu-x",
                "0px"
            );

            menu.style.setProperty(
                "--menu-y",
                "0px"
            );

            menu.removeAttribute("open");

            this.visibleMenu = undefined;
        }
    }

    public get(id: string) {
        const menu = document.getElementById(id);

        if (menu) {
            return menu;
        } else {
            throw new Error(`Menu with id "${id}" could not be found.`);
        }
    }

    public update(menuId: string, itemId: string, data: Partial<MenuItem>) {
        const menu = this.get(menuId);
        const item = menu.querySelector(`#${itemId}`);

        if (item) {
            const {
                disabled,
                visible,
                label,
                icon,
                iconColour,
                hotkey
            } = data;

            if (typeof (disabled) !== "undefined") {
                item.setAttribute("data-disabled", disabled.toString())
            }

            if (typeof (visible) !== "undefined") {
                item.setAttribute("data-visible", visible.toString())
            }

            if (typeof (label) !== "undefined") {
                item.getElementsByClassName("contextmenu-item-label")[0]
                    .textContent = label;
            }

            if (typeof (icon) !== "undefined") {
                (item.getElementsByClassName(
                    "contextmenu-item-icon"
                )[0] as any)
                    .style.backgroundImage = `url(${icon})`;
            }

            if (typeof (iconColour) !== "undefined") {
                (item.getElementsByClassName(
                    "contextmenu-item-icon"
                )[0] as any)
                    .style.fill = iconColour;
            }

            if (typeof (hotkey) !== "undefined") {
                item.getElementsByClassName("contextmenu-item-keybind")[0]
                    .textContent = hotkey.join("+");
            }
        } else {
            throw new Error(`Menu item with id "${itemId}" could not be found.`);
        }
    }
}