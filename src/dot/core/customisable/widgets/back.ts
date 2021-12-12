import CustomisableUI from "..";
import { kBackIcon } from "../../icons";

export default class BackButton extends CustomisableUI.Widget {
    public constructor() {
        super("back-button", {
            name: "Back",
            icon: kBackIcon,
            l10nId: "navigation-back-button"
        })
    }

    public onClick() {
        console.log("hello back button")
    }
}