import { MenuItem } from ".";
import { dot } from "../../api";

export class Maximise extends MenuItem {
    public onClick() {
        dot.window.maximise();
    }

    public get label() {
        if (
            dot.window.windowState.sizemode == "maximised"
        ) {
            return "Restore";
        } else {
            return "Maximise";
        }
    }

    constructor() {
        super({
            id: "context-maximise",
            type: "item",
            category: "window",

            description: "Maximises the open window."
        });
    }
}
