import React from "react";
import ReactDOM from "react-dom";
import { dot } from ".";
import { MenuContext, TemplatedMenu } from "../menus";
import { MenuItem } from "../menus/components";
import { componentsRegistry } from "../menus/components/registry";
import { templatesRegistry } from "../menus/templates/registry";

interface MenuRect {
    x?: number
    y?: number,
    el?: HTMLElement | null
}

const buildMenu = (item: any, context: any) => {
    if (item.type == "separator") {
        return React.createElement(
            "hr",
            { className: "contextmenu-separator" }
        );
    }

    const props: any = {
        id: item.id,
        className: "contextmenu-item",
        onClick: (...args: any[]) => {
            if (item.onClick) item.onClick(...args);

            dot.menus.clear(true);
        }
    }

    if (item.disabled !== null) {
        props["data-disabled"] = item.disabled
    }

    if (item.visible !== null) {
        props["data-visible"] = item.visible
    }

    const itemIcon = React.createElement("i", {
        className: "contextmenu-item-icon",
        style: { backgroundImage: `url(${(item.iconPrefix || "")}${item.icon})` }
    });

    const itemLabel = React.createElement("label", {
        className: "contextmenu-item-label"
    }, item.label);

    const itemKeybind = React.createElement("label", {
        className: "contextmenu-item-keybind",
        style: {
            display: !item.hotkey ? "none" : ""
        }
    }, item.hotkey?.toString());

    const itemContainer = React.createElement(
        "div",
        props,
        itemIcon,
        itemLabel,
        itemKeybind
    );

    return itemContainer;
}

export class MenusAPI {
    public visibleMenu: HTMLDivElement | undefined;
    public visibleMenuId: string | undefined;

    public elementOpener: Element | undefined;

    public templates = templatesRegistry;
    public components = componentsRegistry;

    public create(template: string | Partial<MenuItem>[], bounds: MenuRect, context: MenuContext) {
        const type = typeof (template);

        let temp: TemplatedMenu | undefined;

        const id = temp ? temp.id : `menu-${dot.utilities.makeID(2)}`
        const children: React.DetailedReactHTMLElement<any, HTMLElement>[] = [];

        if (type == "string") {
            if (!(this.templates as any)[template as string]) {
                return console.error(`Menu with id "${template}" not found.`);
            }

            temp = new (this.templates as any)[template as string];

            if (temp) {
                const userLayout = dot.prefs.get(temp.layoutPref);

                const layout: MenuItem[] = userLayout
                    ? userLayout
                    : temp.defaultLayout;

                layout.forEach((item: any) => {
                    const isClass = !!(item as any).prototype;
                    if (isClass) item = new item({ ...context });

                    const constructed = buildMenu(item, context);

                    children.push(constructed);
                });
            }
        } else if (Array.isArray(template)) {
            template.forEach((item: Partial<MenuItem>) => {
                const constructed = buildMenu(item, context);

                children.push(constructed);
            })
        }

        const menuContainer = React.createElement(
            "menu",
            {
                id
            },
            ...children
        );

        const menuMount = document.createElement("div");

        document.getElementById("mainPopupSet")?.appendChild(menuMount);

        ReactDOM.render(
            menuContainer,
            menuMount
        );

        const {
            width: winWidth,
            height: winHeight
        } = document.documentElement.getBoundingClientRect();

        const {
            scrollWidth: menuWidth,
            scrollHeight: menuHeight
        } = (document.getElementById(id) as any);

        if (bounds.el) {
            const elRect = bounds.el.getBoundingClientRect();

            bounds.x = (elRect.x + elRect.width);
            bounds.y = (elRect.y + elRect.height);
        } else {
            bounds.x = bounds.x || 0;
            bounds.y = bounds.y || 0;
        }

        document.getElementById(id)?.style.setProperty(
            "--menu-x", `${bounds.x >= (winWidth - menuWidth)
                ? bounds.x - menuWidth
                : bounds.x}px`
        );

        document.getElementById(id)?.style.setProperty(
            "--menu-y", `${bounds.y >= (winHeight - menuHeight)
                ? bounds.y - menuHeight
                : bounds.y}px`
        );

        document.getElementById(id)?.setAttribute("open", "true");

        if (this.elementOpener) {
            this.elementOpener.removeAttribute("menu-open");
            this.elementOpener = undefined;
        }

        this.visibleMenu = menuMount;
        this.visibleMenuId = id;
        this.elementOpener = bounds.el || undefined;

        if (this.elementOpener) {
            this.elementOpener.setAttribute("menu-open", "true");
        }

        return temp;
    }

    public clear(force?: boolean) {
        if (!this.visibleMenu || !dot.utilities.canPopupAutohide && !force) return;

        ReactDOM.unmountComponentAtNode(this.visibleMenu);
        this.visibleMenu.outerHTML = "";
        this.visibleMenu = undefined;

        if (this.elementOpener) {
            this.elementOpener.removeAttribute("menu-open");
            this.elementOpener = undefined;
        }
    }
}