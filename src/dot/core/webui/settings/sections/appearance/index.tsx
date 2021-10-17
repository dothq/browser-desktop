import { Section } from "..";
import { Theme } from "./theme";

export class Appearance extends Section {
    public id: string = "appearance";
    public name: string = "Appearance";
    public icon: string =
        "chrome://dot/content/skin/icons/customise.svg";

    public children = [
        { title: "Themes", element: Theme }
    ];
}
