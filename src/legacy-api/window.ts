import { EventEmitter } from "events";
import { dot } from "../api";
import {
    AppConstants,
    ChromeUtils,
    PrivateBrowsingUtils
} from "../modules";

const { OS } = ChromeUtils.import(
    "resource://gre/modules/osfile.jsm"
);
const { FileUtils } = ChromeUtils.import(
    "resource://gre/modules/FileUtils.jsm"
);

export class WindowAPI extends EventEmitter {
    public windowClass = new Set();

    private _windowStateCache: any = {};

    public openNew({
        type,
        remote,
        fission
    }: {
        type?: "normal" | "private";
        remote?: boolean;
        fission?: boolean;
    }) {
        let args = "";
        const isBrowserNavigator =
            document.documentElement.getAttribute(
                "windowtype"
            ) == "navigator:browser";
        let extraFeatures = "";

        if (type == "private") {
            extraFeatures = ",private";
            args = "about:privatebrowsing";
        } else {
            extraFeatures = ",non-private";
        }

        if (remote) {
            extraFeatures += ",remote";
        } else if (remote === false) {
            extraFeatures += ",non-remote";
        }

        if (fission) {
            extraFeatures += ",fission";
        } else if (fission === false) {
            extraFeatures += ",non-fission";
        }

        // Maximised
        if (window.windowState == 1)
            extraFeatures += ",suppressanimation";

        let win: Window;

        if (
            window &&
            isBrowserNavigator &&
            window.content &&
            window.content.document
        ) {
            const charSet =
                window.content.document.characterSet;
            const charSetArg = `charset=${charSet}`;

            win = window.openDialog(
                AppConstants.BROWSER_CHROME_URL,
                "_blank",
                "chrome,all,dialog=no" + extraFeatures,
                args,
                charSetArg
            );
        } else {
            win = window.openDialog(
                AppConstants.BROWSER_CHROME_URL,
                "_blank",
                "chrome,all,dialog=no" + extraFeatures,
                args
            );
        }

        win.addEventListener(
            "MozAfterPaint",
            () => {
                console.log(
                    "Started another browser process."
                );
            },
            { once: true }
        );

        return win;
    }

    public isPrivate() {
        return PrivateBrowsingUtils.isWindowPrivate(
            window
        );
    }

    public updateWindowTitle() {
        try {
            const tab = dot.tabs.selectedTab;

            if (tab) {
                document.title = `${tab.title} - Dot Browser`;
            }
        } catch (e) {}
    }

    public get windowState() {
        const { width, height } =
            document.documentElement.getBoundingClientRect();
        const { mozInnerScreenX: x, mozInnerScreenY: y } =
            window;

        const sizemode =
            screen.availWidth == width
                ? "maximised"
                : "normal";
        const titlebar =
            document.documentElement.getAttribute(
                "chromemargin"
            ) == "0,2,2,2"
                ? "hidden"
                : "shown";

        const state = {
            width,
            height,
            x,
            y,
            sizemode,
            titlebar
        };

        if (
            this._windowStateCache &&
            this._windowStateCache == state
        ) {
            return this._windowStateCache;
        } else {
            this._windowStateCache = state;
            return state;
        }
    }

    public async onWindowStateUpdated() {
        try {
            const windowStore = FileUtils.getDir(
                "ProfLD",
                ["window.json"]
            );

            const state = JSON.stringify(
                this.windowState
            );

            const encoder = new TextEncoder();
            const data = encoder.encode(state);

            await OS.File.writeAtomic(
                windowStore.path,
                data,
                {
                    tmpPath: `${windowStore.path}.tmp`
                }
            );
        } catch (e) {
            throw e;
        }
    }

    public async updateWindowState() {
        try {
            const data = await OS.File.read(
                FileUtils.getDir("ProfLD", [
                    "window.json"
                ]).path,
                { encoding: "utf-8" }
            );

            const windowState = JSON.parse(data);

            const {
                width,
                height,
                x,
                y,
                sizemode,
                titlebar
            } = windowState;

            if (sizemode == "maximised")
                this.maximise(true);
            else {
                window.resizeTo(width, height);
                window.moveTo(x, y);
            }

            if (titlebar == "shown")
                dot.titlebar.nativeTitlebarEnabled = true;
            else
                dot.titlebar.nativeTitlebarEnabled =
                    false;
        } catch (e) {
            await this.onWindowStateUpdated();
        }
    }

    public minimise() {
        window.minimize();
    }

    public maximise(force?: boolean) {
        // Window is already maximised
        if (
            this.windowState.sizemode == "maximised" &&
            !force
        )
            return window.restore();

        window.maximize();
    }

    public quit() {
        window.close();
    }

    public addWindowClass(
        name: string,
        condition?: boolean,
        target?: HTMLElement
    ) {
        if (
            typeof condition == "boolean" &&
            condition == false
        )
            return;

        const element = target
            ? target
            : document.getElementById("browser");

        element?.classList.add(name);
        this.windowClass.add(name);
    }

    public removeWindowClass(
        name: string,
        target?: HTMLElement
    ) {
        const element = target
            ? target
            : document.getElementById("browser");

        element?.classList.remove(name);
        this.windowClass.delete(name);
    }

    public toggleWindowClass(
        name: string,
        condition: boolean,
        target?: HTMLElement
    ) {
        if (condition)
            this.addWindowClass(name, condition, target);
        else this.removeWindowClass(name, target);
    }

    public removeWindowClassByNamespace(
        prefix: string,
        target?: HTMLElement
    ) {
        const element = target
            ? target
            : document.getElementById("browser");

        element?.classList.forEach((i) => {
            if (i.startsWith(prefix)) {
                element?.classList.remove(i);
                this.windowClass.delete(i);
            }
        });
    }

    public toggleWindowAttribute(
        key: string,
        value: string,
        initialValue?: boolean
    ) {
        const browserMount =
            document.getElementById("browser");

        if (!browserMount?.getAttribute(key)) {
            return browserMount?.setAttribute(key, value);
        }

        document
            .getElementById("browser")
            ?.toggleAttribute(key, initialValue);
    }

    public onAppCommand(event: any) {
        switch (event.command) {
            case "Back":
                dot.utilities.doCommand("Browser:GoBack");
                break;
            case "Forward":
                dot.utilities.doCommand(
                    "Browser:GoForward"
                );
                break;
            case "Reload":
                dot.utilities.doCommand("Browser:Reload");
                break;
            case "Stop":
                dot.utilities.doCommand("Browser:Stop");
                break;
            case "Search":
                // todo
                break;
            case "Bookmarks":
                // todo
                break;
            case "Home":
                dot.utilities.doCommand("Browser:Home");
                break;
            case "New":
                dot.utilities.doCommand("Browser:NewTab");
                break;
            case "Close":
                // todo
                break;
            case "Find":
                // todo
                break;
            case "Help":
                // todo
                break;
            case "Open":
                // todo
                break;
            case "Print":
                // todo
                break;
            case "Save":
                // todo
                break;
            case "SendMail":
                // todo
                break;
            default:
                return;
        }

        event.stopPropagation();
        event.preventDefault();
    }

    public constructor() {
        super();
    }
}
