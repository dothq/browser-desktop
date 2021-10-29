import EventEmitter from "events";
import React from "react";
import ReactDOM from "react-dom";
import { dot } from "../api";
import { ContextMenu } from "../components/ContextMenu";
import { AppConstants, Ci } from "../modules";
import { exportPublic } from "../shared/globals";

export interface MenuItem {
    id: string,
    label?: string,
    icon?: string,
    accelerator?: string,
    role?: MenuItemRole,
    click?: (item: MenuItem, window: Window, event: KeyboardEvent) => void,
    change?: (data: any) => void,
    enabled?: boolean,
    visible?: boolean,
    checked?: boolean,
    type?: 'normal' | "separator" | "checkbox" | "radio",
    submenu?: MenuItem[]
}

export type MenuItemRole = 'about' | 'close' | 'copy' | 'cut' | 'delete' | 'forcereload' | 'front' | 'help' | 'hide' | 'hideothers' | 'minimize' |
    'toggledevtools' | 'togglefullscreen' | 'undo' | 'unhide' | 'window' | 'zoom' | 'zoomin' | 'zoomout' | 'togglespellchecker' |
    'appmenu' | 'filemenu' | 'editmenu' | 'viewmenu' | 'windowmenu' | 'sharemenu';

export type MenuPopupOptions = { 
    x?: number, 
    y?: number, 
    callback?: (result: boolean) => void,
    mount?: HTMLElement
};

export const menuRoles: Record<MenuItemRole, MenuItem | {}> = {
    about: {
        id: "about",
        label: "About Dot Browser",
        type: "normal",
        click: () => console.log(AppConstants)
    },
    close: {
        id: "close",
        label: "Quit",
        type: "normal",
        accelerator: "CmdOrCtrl+Q",
        click: () => dot.window.quit()
    },
    copy: {
        id: "copy",
        label: "Copy",
        type: "normal",
        accelerator: "CmdOrCtrl+C",
        click: () => document.execCommand("copy")
    },
    cut: {
        id: "cut",
        label: "Cut",
        type: "normal",
        accelerator: "CmdOrCtrl+X",
        click: () => document.execCommand("cut")
    },
    delete: {
        id: "delete",
        label: "Delete",
        type: "normal",
        click: () => document.execCommand("delete")
    },
    forcereload: {
        id: "forcereload",
        label: "Force Reload",
        type: "normal",
        click: () => dot.tabs.selectedTab?.reload(
            Ci.nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE
        )
    },
    front: {},
    help: {},
    hide: {},
    hideothers: {},
    minimize: {
        id: "minimize",
        label: "Minimize",
        type: "normal",
        click: () => dot.window.minimise()
    },
    toggledevtools: {},
    togglefullscreen: {
        id: "togglefullscreen",
        label: "Toggle Fullscreen",
        type: "normal",
        click: () => dot.tabs.selectedTab?.webContents.requestFullscreen()
    },
    undo: {
        id: "undo",
        label: "Undo",
        type: "normal",
        accelerator: "CmdOrCtrl+Z",
        click: () => document.execCommand("undo")
    },
    unhide: {},
    window: {},
    zoom: {},
    zoomin: {
        id: "zoomin",
        label: "Zoom In",
        type: "normal",
        accelerator: "CmdOrCtrl+=",
        click: () => dot.tabs.selectedTab?.zoomManager.enlarge()
    },
    zoomout: {
        id: "zoomout",
        label: "Zoom Out",
        type: "normal",
        accelerator: "CmdOrCtrl+-",
        click: () => dot.tabs.selectedTab?.zoomManager.reduce()
    },
    togglespellchecker: {},
    appmenu: {},
    filemenu: {},
    editmenu: {},
    viewmenu: {},
    windowmenu: {},
    sharemenu: {}
}

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

        const menu = React.createElement(
            ContextMenu,
            { 
                ...options,
                template: this.template,
                callback: (result: boolean) => {
                    this.closePopup();
                    
                    if(options?.callback) {
                        options?.callback(result);
                    }
                }
            }
        );

        let mount: any;

        if(options?.mount) mount = options.mount;
        else {
            mount = document.createElement("div");
            document.getElementById("browser-popups")?.appendChild(mount);
        }

        mount.style.position = "absolute";
        mount.style.width = "100%";
        mount.style.height = "100%";
        mount.style.top = "0";
        mount.style.left = "0";
        mount.style.zIndex = "999999999";

        ReactDOM.render(
            menu, 
            mount
        );

        this.mount = mount;
    }

    public closePopup(force?: boolean) {
        if(this.isMounted && this.mount) {
            if (
                !dot.utilities.canPopupAutohide && 
                !force 
            ) return;
    
            ReactDOM.unmountComponentAtNode(this.mount);
            
            this.mount.outerHTML = "";
            this.mount = undefined;
        }
    }

    static buildFromTemplate(
        template: MenuItem[]
    ): Menu {
        const menu = new Menu(template);

        return menu;
    }

    public constructor(template?: MenuItem[]) {
        super();

        if(template) {
            template.forEach((item, index) => {
                if(item.role && menuRoles[item.role]) {
                    template[index] = {
                        ...template[index],
                        ...menuRoles[item.role]
                    };
                }
            })

            this.template = template;
        }
    }
}

exportPublic("Menu", Menu);