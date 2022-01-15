import { Browser } from "index";
import { div, RefObject } from "oikia";

class BrowserTitlebar {
    public render(ref: RefObject<HTMLDivElement>) {
        return (
            div({
                id: "browser-titlebar",
                ref
            },
            
            )
        )
    }

    public constructor(private browser: Browser) {}
}

export default BrowserTitlebar;