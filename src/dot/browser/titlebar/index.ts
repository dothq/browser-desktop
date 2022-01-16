import { Target } from "browser/customisable/decorators";
import CustomisableUITarget from "browser/customisable/target";
import dot from "index";

@Target({
    id: "titlebar",

    visible: () => dot.preferences.get("dot.ui.titlebar.visible", true),
    movable: () => true,
})
class BrowserTitlebar extends CustomisableUITarget {}

export default BrowserTitlebar;