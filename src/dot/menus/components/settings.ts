import { MenuItem } from ".";

export class Settings extends MenuItem {
    constructor() {
        super({
            id: "context-settings",
            type: "item",
            category: "browser",

            label: "Settings",
            icon: "settings.svg",
            description: "Manage browser preferences and settings."
        })
    }
}