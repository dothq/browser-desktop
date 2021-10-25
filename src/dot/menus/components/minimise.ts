import { MenuItem } from ".";
import { dot } from "../../api";

export class Minimise extends MenuItem {
    public onClick() {
        dot.window.minimise();
    }

    constructor() {
        super({
            id: "minimise",
            type: "item",
            category: "window",

            label: "Minimise",
            description: "Minimises the open window."
        });
    }
}
