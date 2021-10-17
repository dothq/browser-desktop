import { Section } from "..";

export class Experiments extends Section {
    id = "experiments";
    name = "Experiments";
    icon = "chrome://dot/content/skin/icons/lab.svg";

    protected _visible = () => {
        return window.dot.prefs.get(
            "browser.preferences.experimental",
            false
        );
    };

    public children = [];
}
