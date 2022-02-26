import { Target } from "browser/customisable/decorators";
import dot from "index";

@Target({
    id: "toolbar",

    visible: () =>
        dot.preferences.get(
            "dot.ui.toolbar.visible",
            true
        ),
    movable: () => true
})
class BrowserToolbar {}

export default BrowserToolbar;
