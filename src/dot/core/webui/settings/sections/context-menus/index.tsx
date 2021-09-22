import { Section } from "..";

export class ContextMenus extends Section {
    public children = [

    ]

    public constructor() {
        super({
            id: "context-menus",
            name: "Context Menus",
            icon: "chrome://dot/content/skin/icons/menu.svg"
        })
    }
}