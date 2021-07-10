import { EventEmitter } from "events";
import { dot } from "../app";
import { ChromeUtils } from "../modules";

const { OS } = ChromeUtils.import("resource://gre/modules/osfile.jsm");
const { FileUtils } = ChromeUtils.import(
    "resource://gre/modules/FileUtils.jsm"
)

export class WindowAPI extends EventEmitter {
    public windowClass = new Set();

    public get windowState() {
        const { width, height } = document.documentElement.getBoundingClientRect();
        const { mozInnerScreenX: x, mozInnerScreenY: y } = window;

        const sizemode = screen.availWidth == width ? "maximised" : "normal";
        const titlebar = document.documentElement.getAttribute("chromemargin") == "0,2,2,2"
            ? "hidden"
            : "shown"

        return {
            width,
            height,
            x,
            y,
            sizemode,
            titlebar
        };
    }

    public async onWindowStateUpdated() {
        try {
            const windowStore = FileUtils.getDir("ProfLD", [
                "window.json"
            ]);

            const state = JSON.stringify(this.windowState);

            const encoder = new TextEncoder();
            const data = encoder.encode(state);

            await OS.File.writeAtomic(windowStore.path, data, {
                tmpPath: `${windowStore.path}.tmp`,
            });
        } catch(e) {
            throw e;
        }
    }

    public async updateWindowState() {
        const data = await OS.File.read(FileUtils.getDir("ProfLD", [
            "window.json"
        ]).path, { encoding: "utf-8" });

        const windowState = JSON.parse(data);

        const { width, height, x, y, sizemode, titlebar } = windowState;

        if (sizemode == "maximised") this.maximise(true);
        else {
            window.resizeTo(width, height);
            window.moveTo(x, y);
        }

        if (titlebar == "shown") dot.titlebar.nativeTitlebarEnabled = true;
        else dot.titlebar.nativeTitlebarEnabled = false;
    }

    public minimise() {
        window.minimize();
    }

    public maximise(force?: boolean) {
        // Window is already maximised
        if (this.windowState.sizemode == "maximised" && !force) return window.restore();

        window.maximize();
    }

    public quit() {
        window.close();
    }

    public addWindowClass(name: string) {
        document.getElementById("browser")?.classList.add(name);
        this.windowClass.add(name);
    }

    public removeWindowClass(name: string) {
        document.getElementById("browser")?.classList.remove(name);
        this.windowClass.delete(name);
    }

    public toggleWindowAttribute(key: string, value: string, initialValue?: boolean) {
        const browserMount = document.getElementById("browser");

        if (!browserMount?.getAttribute(key)) {
            return browserMount?.setAttribute(key, value);
        }

        document.getElementById("browser")?.toggleAttribute(key, initialValue);
    }
}