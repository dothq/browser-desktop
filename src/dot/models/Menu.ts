import EventEmitter from "events";
import { render } from "preact";
import React from "react";
import ReactDOM from "react-dom";
import { dot } from "../api";
import { ContextMenu } from "../components/ContextMenu";
import { AboutMenuRole } from "../menus/roles/about";
import { BookmarkCurrentMenuRole } from "../menus/roles/bookmark-current";
import { BookmarksBarToggleMenuRole } from "../menus/roles/bookmarks-bar-toggle";
import { BookmarksManagerMenuRole } from "../menus/roles/bookmarks-manager";
import { BookmarksMenuMenuRole } from "../menus/roles/bookmarks-menu";
import { CloseMenuRole } from "../menus/roles/close";
import { CopyMenuRole } from "../menus/roles/copy";
import { CutMenuRole } from "../menus/roles/cut";
import { DeleteMenuRole } from "../menus/roles/delete";
import { ForceReloadMenuRole } from "../menus/roles/force-reload";
import { HelpMenuMenuRole } from "../menus/roles/help-menu";
import { HistoryMenuMenuRole } from "../menus/roles/history-menu";
import { MinimiseMenuRole } from "../menus/roles/minimise";
import { NewPrivateWindowMenuRole } from "../menus/roles/new-private-window";
import { NewTabMenuRole } from "../menus/roles/new-tab";
import { NewWindowMenuRole } from "../menus/roles/new-window";
import { ReloadMenuRole } from "../menus/roles/reload";
import { ToggleFullscreenMenuRole } from "../menus/roles/toggle-fullscreen";
import { UndoMenuRole } from "../menus/roles/undo";
import { ZoomInMenuRole } from "../menus/roles/zoom-in";
import { ZoomOutMenuRole } from "../menus/roles/zoom-out";
import { exportPublic } from "../shared/globals";

export interface MenuItem {
    id: string;
    label?: string;
    icon?: string;
    accelerator?: string;
    role?: MenuItemRole;
    click?: (
        item: MenuItem,
        window: Window,
        event: KeyboardEvent
    ) => void;
    change?: (data: any) => void;
    enabled?: boolean;
    visible?: boolean;
    checked?: boolean;
    type?: "normal" | "separator" | "checkbox" | "radio";
    submenu?: MenuItem[];
}

export type DotSpecificItemRoles =
    | "bookmarksmenu"
    | "bookmark-current"
    | "bookmarks-bar-toggle"
    | "bookmarks-manager"
    | "historymenu"
    | "newtab"
    | "newwindow"
    | "newprivatewindow"
    | "reload";

export type MenuItemRole =
    | "about"
    | "close"
    | "copy"
    | "cut"
    | "delete"
    | "forcereload"
    | "front"
    | "help"
    | "hide"
    | "hideothers"
    | "minimize"
    | "toggledevtools"
    | "togglefullscreen"
    | "undo"
    | "unhide"
    | "window"
    | "zoom"
    | "zoomin"
    | "zoomout"
    | "togglespellchecker"
    | "appmenu"
    | "filemenu"
    | "editmenu"
    | "viewmenu"
    | "windowmenu"
    | "sharemenu"
    | DotSpecificItemRoles;

export type MenuPopupOptions = {
    x?: number;
    y?: number;
    callback?: (result: boolean) => void;
    mount?: HTMLElement;
};

export const menuRoles: Record<
    MenuItemRole,
    MenuItem | {}
> = {
    about: AboutMenuRole,
    close: CloseMenuRole,
    copy: CopyMenuRole,
    cut: CutMenuRole,
    delete: DeleteMenuRole,
    forcereload: ForceReloadMenuRole,
    front: {},
    help: HelpMenuMenuRole,
    hide: {},
    hideothers: {},
    minimize: MinimiseMenuRole,
    toggledevtools: {},
    togglefullscreen: ToggleFullscreenMenuRole,
    undo: UndoMenuRole,
    unhide: {},
    window: {},
    zoom: {},
    zoomin: ZoomInMenuRole,
    zoomout: ZoomOutMenuRole,
    togglespellchecker: {},
    appmenu: {},
    filemenu: {},
    editmenu: {},
    viewmenu: {},
    windowmenu: {},
    sharemenu: {},

    bookmarksmenu: BookmarksMenuMenuRole,
    "bookmark-current": BookmarkCurrentMenuRole,
    "bookmarks-bar-toggle": BookmarksBarToggleMenuRole,
    "bookmarks-manager": BookmarksManagerMenuRole,

    historymenu: HistoryMenuMenuRole,

    newtab: NewTabMenuRole,
    newwindow: NewWindowMenuRole,
    newprivatewindow: NewPrivateWindowMenuRole,

    reload: ReloadMenuRole
};

export class Menu extends EventEmitter {
    private template: MenuItem[] = [];
    private mount?: HTMLDivElement;

    private get isMounted() {
        return !!this.mount;
    }

    public get visible() {
        return this.isMounted;
    }

    public popup(options?: MenuPopupOptions) {
        this.closePopup();

        const menu = React.createElement(ContextMenu, {
            ...options,
            template: this.template,
            callback: (result: boolean) => {
                this.closePopup(true);

                if (options?.callback) {
                    options?.callback(result);
                }
            }
        });

        let mount: any;

        if (options?.mount) mount = options.mount;
        else {
            mount = document.createElement("div");
            document
                .getElementById("browser-popups")
                ?.appendChild(mount);
        }

        mount.style.position = "absolute";
        mount.style.width = "100%";
        mount.style.height = "100%";
        mount.style.top = "0";
        mount.style.left = "0";
        mount.style.zIndex = "999999999";

        render(menu, mount);

        this.mount = mount;
        this.registerEvents(this.mount);
    }

    public closePopup(force?: boolean) {
        if (this.isMounted && this.mount) {
            if (!dot.utilities.canPopupAutohide && !force)
                return;

            ReactDOM.unmountComponentAtNode(this.mount);

            this.mount.outerHTML = "";
            this.mount = undefined;
        }
    }

    static buildFromTemplate(template: MenuItem[]): Menu {
        const menu = new Menu(template);

        return menu;
    }

    private registerEvents(mount?: HTMLElement) {
        if (!mount) return;

        mount.addEventListener("mousedown", (e) => {
            if (e.target == mount)
                mount.style.opacity = "0";
        });

        mount.addEventListener("mouseup", (e) => {
            if (e.target == mount) this.closePopup();
        });
    }

    public doTemplateChecks(template: MenuItem[]) {
        template.forEach((item, index) => {
            // Replace all roles with their associated menuitem
            if (item.role && menuRoles[item.role]) {
                item = {
                    ...template[index],
                    ...menuRoles[item.role]
                };
            }

            // Make sure there are no duplicate IDs in the template
            if (
                !item.id ||
                !item.id.length ||
                template.filter((i) => i.id == item.id)
                    .length > 1
            ) {
                const id =
                    item.id && item.id.length
                        ? `${
                              item.id
                          }-${dot.utilities.makeID(2)}`
                        : dot.utilities.makeID(2);

                if (
                    item.id &&
                    item.id.length &&
                    template.filter(
                        (i) => i.id == item.id
                    ).length > 1
                ) {
                    console.warn(
                        `Menu already contains item with the ID of "${item.id}".`
                    );
                }

                item.id = id;
            }

            // This NEEDS to be done last
            if (item.accelerator && item.id) {
                const definedShortcut = dot.prefs.get(
                    `dot.keybinds.${item.id}`
                );

                let accelerator = item.accelerator;

                if (
                    definedShortcut &&
                    definedShortcut.length
                ) {
                    accelerator = definedShortcut;
                }

                item.accelerator =
                    dot.shortcuts.toString(accelerator);
            }

            template[index] = item;

            if (
                template[index].submenu &&
                template[index].submenu?.length
            ) {
                const submenu = template[index]
                    .submenu as MenuItem[];

                template[index].submenu =
                    this.doTemplateChecks(submenu);
            }
        });

        return template;
    }

    public constructor(template?: MenuItem[]) {
        super();

        if (template) {
            this.template =
                this.doTemplateChecks(template);
        }
    }
}

exportPublic("Menu", Menu);
