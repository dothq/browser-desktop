import { MenuItem } from ".";
import { dot } from "../../api";

export class Settings extends MenuItem {
    constructor() {
        super({
            id: "settings",
            type: "item",
            category: "browser",

            label: "Settings",
            icon: "settings.svg",
            description:
                "Manage browser preferences and settings."
        });
    }

    onClick() {
        dot.utilities.doCommand(
            "Browser:OpenPreferences"
        );
    }
}
