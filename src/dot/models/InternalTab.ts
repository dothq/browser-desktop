import { dot } from "../api";
import { builtInPageFavicons, builtInPageTitles } from "../shared/built-in";
import { Tab } from "./Tab";

export class InternalTab extends Tab {
    public internal: boolean = true;

    public faviconUrl: string = "";

    private _internalTitle: string = "";

    public get title() {
        return this._internalTitle;
    }

    public set title(title: string) {
        this._internalTitle = title;
    }

    constructor({ id }: { id: string }) {
        super({
            url: "about:blank",
            internal: true,
            id
        });

        this.state = "idle";

        this.init(id);
    }

    public init(id: string) {
        this.faviconUrl = builtInPageFavicons[id];
        this.title = builtInPageTitles[id];
    }

    public select() {
        console.log("internal", this.id);
        dot.browsersPrivate.select(this.id, true);
    }
}