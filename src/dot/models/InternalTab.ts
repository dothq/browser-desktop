import { builtInPageFavicons } from "../shared/built-in";
import { Tab } from "./Tab";

export class InternalTab extends Tab {
    public internal: boolean = true;

    constructor({ id }: { id: string }) {
        super({
            url: "about:blank",
            background: false,
            internal: true
        })

        this.faviconUrl = builtInPageFavicons[id];
        this.title = ""
    }
}