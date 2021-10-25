import { MenuItem } from ".";

export class Customise extends MenuItem {
    constructor() {
        super({
            id: "customise",
            type: "item",
            category: "window",

            label: "Customise",
            description: "Customise your browser."
        });
    }
}
