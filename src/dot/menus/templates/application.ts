import { TemplatedMenu } from "..";
import { Bookmarks } from "../components/bookmarks";
import { Downloads } from "../components/downloads";
import { FindInPage } from "../components/find-in-page";
import { Help } from "../components/help";
import { History } from "../components/history";
import { NewPrivateWindow } from "../components/new-private-window";
import { NewTab } from "../components/new-tab";
import { NewWindow } from "../components/new-window";
import { Notes } from "../components/notes";
import { PrintPage } from "../components/print";
import { Quit } from "../components/quit";
import { SavePageAs } from "../components/save-as";
import { ________________ } from "../components/separator";
import { Settings } from "../components/settings";

export class AppMenu extends TemplatedMenu {
    constructor() {
        super({
            id: "context-application",
            name: "Dot Browser",
            description: "The main application menu for the browser.",

            layoutPref: "dot.menus.app.layout",
            defaultLayout: [
                NewTab,
                NewWindow,
                NewPrivateWindow,
                ________________,
                History,
                Bookmarks,
                Downloads,
                Notes,
                ________________,
                SavePageAs,
                PrintPage,
                FindInPage,
                ________________,
                Settings,
                Help,
                Quit
            ]
        })
    }
}