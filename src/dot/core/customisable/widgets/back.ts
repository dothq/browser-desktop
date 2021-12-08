import CustomisableUI from "..";

export default class BackButton extends CustomisableUI.Widget {
    public constructor() {
        super("back-button", {
            name: "Back",
            l10nId: "navigation-back-button"
        })
    }

    public onClick() {
        console.log("hello back button")
    }
}