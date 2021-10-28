import { SettingsEvent } from ".";
import { timers } from "../../../services/timers";
import { HashChange } from "./hash-change";

export class Load extends SettingsEvent {
    public constructor() {
        super("load");
    }

    public action() {
        timers.stop("SettingsLoad");

        // Register all events on page load
        new HashChange();
    }
}
