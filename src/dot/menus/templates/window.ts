import { TemplatedMenu } from "..";
import { Customise } from "../components/customise";
import { Maximise } from "../components/maximise";
import { Minimise } from "../components/minimise";
import { NewTab } from "../components/new-tab";
import { NewWindow } from "../components/new-window";
import { Quit } from "../components/quit";
import { ReopenClosedTab } from "../components/reopen-closed-tab";
import { ________________ } from "../components/separator";

export class WindowMenu extends TemplatedMenu {
    constructor() {
        super({
            id: "context-window",
            name: "Window",
            description: "Context menu shown when right clicking titlebars.",

            layoutPref: "dot.menus.window.layout",
            defaultLayout: [
                Minimise,
                Maximise,
                ________________,
                NewTab,
                NewWindow,
                ReopenClosedTab,
                ________________,
                Customise,
                ________________,
                Quit
            ]
        })
    }
}