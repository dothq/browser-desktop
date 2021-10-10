import { TemplatedMenu } from "..";
import { AddBookmark } from "../components/add-bookmark";
import { GoBack } from "../components/go-back";
import { GoForward } from "../components/go-forward";
import { InspectElement } from "../components/inspect-element";
import { PrintPage } from "../components/print";
import { Reload } from "../components/reload";
import { SavePageAs } from "../components/save-as";
import { ScreenshotPage } from "../components/screenshot";
import { ________________ } from "../components/separator";
import { ViewPageSource } from "../components/view-page-source";

export class PageMenu extends TemplatedMenu {
    constructor() {
        super({
            id: "context-navigation",
            name: "Page",
            description: "The default menu that appears.",

            layoutPref: "dot.menus.page.layout",
            defaultLayout: [
                GoBack,
                GoForward,
                Reload,
                AddBookmark,
                ________________,
                SavePageAs,
                PrintPage,
                ScreenshotPage,
                ________________,
                ViewPageSource,
                InspectElement
            ]
        });
    }
}
