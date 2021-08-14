import React from "react";
import ReactDOM from "react-dom";
import { dot } from ".";
import { MenuContext, TemplatedMenu } from "../menus";
import { MenuItem } from "../menus/components";
import { componentsRegistry } from "../menus/components/registry";
import { templatesRegistry } from "../menus/templates/registry";

interface MenuRect {
    x: number
    y: number
}

export class MenusAPI {
    public visibleMenu: HTMLDivElement | undefined;
    public visibleMenuId: string | undefined;

    public templates = templatesRegistry;
    public components = componentsRegistry;

    public create(template: string | Partial<MenuItem>[], bounds: MenuRect, context: MenuContext) {
        const type = typeof (template);

        if (type == "string") {
            if (!(this.templates as any)[template as string]) {
                return console.error(`Menu with id "${template}" not found.`);
            }

            const temp: TemplatedMenu = new (this.templates as any)[template as string];
            const userLayout = dot.prefs.get(temp.layoutPref);

            const layout: MenuItem[] = userLayout
                ? userLayout
                : temp.defaultLayout;

            const children: React.DetailedReactHTMLElement<any, HTMLElement>[] = [];

            layout.forEach((item: any) => {
                const isClass = !!(item as any).prototype;

                if (isClass) item = new item({ ...context });

                const untypedItem = (item as any);

                if (item.type == "separator") {
                    return children.push(React.createElement(
                        "hr",
                        { className: "contextmenu-separator" }
                    ));
                }

                const props: any = {
                    id: item.id,
                    className: "contextmenu-item",
                    onClick: (...args: any[]) => {
                        if (item.onClick) item.onClick(...args);

                        dot.menus.clear(true);
                    }
                }

                if (untypedItem.disabled !== null) {
                    props["data-disabled"] = untypedItem.disabled
                }

                if (untypedItem.visible !== null) {
                    props["data-visible"] = untypedItem.visible
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

                children.push(itemContainer);
            });

            const menuContainer = React.createElement(
                "menu",
                {
                    id: temp.id
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
            } = (document.getElementById(temp.id) as any);

            document.getElementById(temp.id)?.style.setProperty(
                "--menu-x", `${bounds.x >= (winWidth - menuWidth)
                    ? bounds.x - menuWidth
                    : bounds.x}px`
            );

            document.getElementById(temp.id)?.style.setProperty(
                "--menu-y", `${bounds.y >= (winHeight - menuHeight)
                    ? bounds.y - menuHeight
                    : bounds.y}px`
            );

            document.getElementById(temp.id)?.setAttribute("open", "true");

            this.visibleMenu = menuMount;
            this.visibleMenuId = temp.id;

            return temp;
        }
    }

    public clear(force?: boolean) {
        if (!this.visibleMenu || !dot.utilities.canPopupAutohide && !force) return;

        ReactDOM.unmountComponentAtNode(this.visibleMenu);
        this.visibleMenu.outerHTML = "";
        this.visibleMenu = undefined;
    }
}