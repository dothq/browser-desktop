import { Browser } from "index";
import { a, div } from "oikia";

class BrowserWindowControls {
    public render() {
        return (
            div({ class: "browser-window-controls" },
                a({ class: "titlebar-min", onClick: window.minimize() }),
                a({ class: "titlebar-max", onClick: window.maximize() }),
                a({ class: "titlebar-restore", onClick: window.restore() }),
                a({ class: "titlebar-close", onClick: window.close() })
            )
        )
    }

    public constructor(private browser: Browser) {}
}