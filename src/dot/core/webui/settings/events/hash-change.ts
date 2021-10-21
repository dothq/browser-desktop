import { SettingsEvent } from ".";

export class HashChange extends SettingsEvent {
    public constructor() {
        super("hashchange");
    }

    public action() {
        // let { hash } = window.location;
        // hash = hash.substr(1);

        // if (!sections[hash]) return;
        // else setActiveSection(hash);
    }
}
