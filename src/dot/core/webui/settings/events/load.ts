import { SettingsEvent } from ".";
import { HashChange } from "./hash-change";

export class Load extends SettingsEvent {
    public constructor() {
        super("load");
    }

    public action() {
        console.log("loaded")

        // Register all events on page load
        new HashChange();
    }
}