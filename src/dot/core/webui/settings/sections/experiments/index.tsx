import { Section } from "..";

export class Experiments extends Section {
    public children = [];

    public constructor() {
        super({
            id: "experiments",
            name: "Experiments",
            icon: "chrome://dot/content/skin/icons/lab.svg",

            visible: () => {
                return window.dot.prefs.get(
                    "browser.preferences.experimental",
                    false
                );
            }
        });
    }
}
