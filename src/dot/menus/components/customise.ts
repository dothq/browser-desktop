import { MenuItem } from ".";

export class Customise extends MenuItem {
    constructor() {
        super({
            id: "context-customise",
            type: "item",
            category: "window",

            label: "Customise",
            description: "Customise your browser."
        });
    }
}
