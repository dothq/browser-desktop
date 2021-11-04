import { makeObservable, observable } from "mobx";
import React from "react";
import ReactDOM from "react-dom";
import { dot } from ".";
import { MenuContext, TemplatedMenu } from "../menus";
import { MenuItem } from "../menus/components";
import { componentsRegistry } from "../menus/components/registry";
import { templatesRegistry } from "../menus/templates/registry";
import { Menu } from "../models/Menu";

interface MenuRect {
    x?: number;
    y?: number;
    el?: HTMLElement | null;
}

const buildMenu = (item: any, context: any) => {
    if (item.type == "separator") {
        return React.createElement("hr", {
            className: "contextmenu-separator"
        });
    }

    const onItemClick = (...args: any[]) => {
        if (item.onClick) item.onClick(...args);

        dot.menus.clear(true);
    };

    const props: any = {
        id: `context-${item.id}`,
        className: "contextmenu-item",
        onMouseUp: onItemClick
    };

    if (item.disabled !== null) {
        props["data-disabled"] = item.disabled;
    }

    if (item.visible !== null) {
        props["data-visible"] = item.visible;
    }

    const itemIcon = React.createElement("i", {
        className: "contextmenu-item-icon",
        style: {
            backgroundImage: `url(${
                item.iconPrefix || ""
            }${item.icon})`
        }
    });

    const itemLabel = React.createElement(
        "label",
        {
            className: "contextmenu-item-label"
        },
        item.label
    );

    const itemKeybind = React.createElement(
        "label",
        {
            className: "contextmenu-item-keybind",
            style: {
                display: !item.keybind ? "none" : ""
            }
        },
        item.keybind
            ? dot.shortcuts.toString(item.keybind)
            : ""
    );

    const itemContainer = React.createElement(
        "div",
        props,
        itemIcon,
        itemLabel,
        itemKeybind
    );

    return itemContainer;
};

export class MenusAPI {
    @observable
    public visibleMenu: HTMLDivElement | undefined;

    @observable
    public visibleMenuId: string | undefined;

    @observable
    public elementOpener: Element | undefined;

    public templates = templatesRegistry;
    public components = componentsRegistry;

    public create(
        template: string | Partial<MenuItem>[],
        bounds: MenuRect,
        context: MenuContext
    ) {
        new Menu();

        const type = typeof template;

        let temp: TemplatedMenu | undefined;

        const id = temp
            ? temp.id
            : `menu-${dot.utilities.makeID(2)}`;
        const children: React.DetailedReactHTMLElement<
            any,
            HTMLElement
        >[] = [];

        if (type == "string") {
            if (
                !(this.templates as any)[
                    template as string
                ]
            ) {
                return console.error(
                    `Menu with id "${template}" not found.`
                );
            }

            temp = new (this.templates as any)[
                template as string
            ]();

            if (temp) {
                const userLayout = dot.prefs.get(
                    temp.layoutPref
                );

                const layout: MenuItem[] = userLayout
                    ? userLayout
                    : temp.defaultLayout;

                layout.forEach((item: any) => {
                    const isClass = !!(item as any)
                        .prototype;
                    if (isClass)
                        item = new item({ ...context });

                    const constructed = buildMenu(
                        item,
                        context
                    );

                    children.push(constructed);
                });
            }
        } else if (Array.isArray(template)) {
            template.forEach(
                (item: Partial<MenuItem>) => {
                    const constructed = buildMenu(
                        item,
                        context
                    );

                    children.push(constructed);
                }
            );
        }

        const menuScrollbox = React.createElement(
            "div",
            {
                className: "menu-container"
            },
            ...children
        );

        const menuBackground = React.createElement(
            "div",
            {
                className: "menu-background"
            }
        );

        const menuContainer = React.createElement(
            "menu",
            {
                id
            },
            menuBackground,
            menuScrollbox
        );

        const menuMount = document.createElement("div");

        menuMount.style.position = "absolute";
        menuMount.style.width = "100%";
        menuMount.style.height = "100%";
        menuMount.style.top = "0";
        menuMount.style.left = "0";
        menuMount.style.zIndex = "999999999999999999999";

        document
            .getElementById("browser-popups")
            ?.appendChild(menuMount);

        ReactDOM.render(menuContainer, menuMount);

        const { width: winWidth, height: winHeight } =
            document.documentElement.getBoundingClientRect();

        const {
            scrollWidth: menuWidth,
            scrollHeight: menuHeight
        } = document.getElementById(id) as any;

        if (bounds.el) {
            const elRect =
                bounds.el.getBoundingClientRect();

            bounds.x = elRect.x + elRect.width;
            bounds.y = elRect.y + elRect.height;
        } else {
            bounds.x = bounds.x || 0;
            bounds.y = bounds.y || 0;
        }

        document
            .getElementById(id)
            ?.style.setProperty(
                "--menu-x",
                `${
                    bounds.x >= winWidth - menuWidth
                        ? bounds.x - menuWidth
                        : bounds.x
                }px`
            );

        document
            .getElementById(id)
            ?.style.setProperty(
                "--menu-y",
                `${
                    bounds.y >= winHeight - menuHeight
                        ? bounds.y - menuHeight
                        : bounds.y
                }px`
            );

        document
            .getElementById(id)
            ?.setAttribute("open", "true");

        if (this.elementOpener) {
            this.elementOpener.removeAttribute(
                "menu-open"
            );
            this.elementOpener = undefined;
        }

        this.visibleMenu = menuMount;
        this.visibleMenuId = id;
        this.elementOpener = bounds.el || undefined;

        if (this.elementOpener) {
            this.elementOpener.setAttribute(
                "menu-open",
                "true"
            );
        }

        let menuOpen = false;
        let mouseUpCount = 0;

        setTimeout(() => {
            menuOpen = true;
        }, 150);

        if (this.visibleMenu) {
            this.visibleMenu.addEventListener(
                "mousedown",
                (e: any) => {
                    if (!dot.utilities.canPopupAutohide)
                        return;

                    if (mouseUpCount >= 2) {
                        if (
                            this.visibleMenu &&
                            !this.visibleMenu?.childNodes[0].contains(
                                e.target
                            )
                        ) {
                            this.visibleMenu.style.opacity =
                                "0";
                            this.elementOpener?.removeAttribute(
                                "menu-open"
                            );
                        }
                    }
                }
            );

            this.visibleMenu.addEventListener(
                "mouseup",
                (e: any) => {
                    ++mouseUpCount;

                    // We do this so we can make sure the user
                    // has completed one full mouseup event
                    if (mouseUpCount >= 2) {
                        if (
                            !this.visibleMenu?.childNodes[0].contains(
                                e.target
                            ) &&
                            menuOpen
                        ) {
                            this.clear();
                        }
                    }
                }
            );
        }

        return temp;
    }

    public clear(force?: boolean) {
        if (
            !this.visibleMenu ||
            (!dot.utilities.canPopupAutohide && !force)
        )
            return;

        ReactDOM.unmountComponentAtNode(this.visibleMenu);
        this.visibleMenu.outerHTML = "";
        this.visibleMenu = undefined;

        if (this.elementOpener) {
            this.elementOpener?.removeAttribute(
                "menu-open"
            );
            this.elementOpener = undefined;
        }
    }

    public constructor() {
        makeObservable(this);

        window.addEventListener(
            "blur",
            () => this.clear(true),
            true
        );
        window.addEventListener("resize", () =>
            this.clear(true)
        );
    }
}
