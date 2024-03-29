import { useID } from "@dothq/id";
import { EventEmitter } from "events";
import { AppConstants, Cc, ChromeUtils, Ci, Services } from "../modules";
import { commands } from "../shared/commands";

const { NetUtil } = ChromeUtils.import(
    "resource://gre/modules/NetUtil.jsm"
);

export class UtilitiesAPI extends EventEmitter {
    private _pageStatusEl = document.getElementById("page-status");

    public canPopupAutohide: boolean = true;

    public availableLanguages: string[] = [];

    public ftl: { [key: string]: any } = {};

    public get pageStatus() {
        if (!this._pageStatusEl) return "";
        return this._pageStatusEl.innerText;
    }

    public set pageStatus(value: string) {
        if (this._pageStatusEl) {
            this._pageStatusEl.style.opacity = value.length == 0 ? "0" : "1";
            this._pageStatusEl.innerText = value;
        }
    }

    public get platform() {
        return AppConstants.platform == "macosx"
            ? "macos"
            : AppConstants.platform == "win"
                ? "windows"
                : AppConstants.platform
    }

    public get browserLanguage() {
        return this.browserLanguages[0]
    }

    public get browserLanguages() {
        return Services.locale.webExposedLocales
    }

    public get linuxDesktopEnvironment() {
        if (this.platform !== "linux") return "";

        return this.getEnv("XDG_CURRENT_DESKTOP");
    }

    public fetchLocale(locale: string) {
        return new Promise((resolve, reject) => {
            NetUtil.asyncFetch({
                uri: `chrome://dot/content/build/${locale}.ftl`,
                loadUsingSystemPrincipal: true
            }, (inputStream: any, status: any) => {
                try {
                    const data: string = NetUtil.readInputStreamToString(
                        inputStream,
                        inputStream.available(),
                        { charset: "utf-8" }
                    );

                    resolve(data);
                } catch (e) {
                    console.error(e);
                    reject(null);
                }
            });
        })
    }

    public doCommand(command: string) {
        return commands[command]();
    }

    public onPageStatusChanged(status: string) {
        this.pageStatus = status;
    }

    public isJSON(data: any) {
        if (typeof (data) == "object") return true;

        let jsonParsed;

        try {
            jsonParsed = JSON.parse(data)
        } catch (e) { }

        // is JSON
        if (
            typeof (data) == "string" &&
            jsonParsed &&
            typeof (jsonParsed) == "object"
        ) {
            // return early
            return true
        } else {
            return false
        }
    }

    public getEnv(name: string) {
        const env = Cc["@mozilla.org/process/environment;1"].getService(
            Ci.nsIEnvironment
        );

        return env.get(name);
    }

    public makeID(rounds?: number) {
        return useID(rounds || 4);
    }

    constructor() {
        super();

        this.on("page-status-changed", this.onPageStatusChanged);
    }
}