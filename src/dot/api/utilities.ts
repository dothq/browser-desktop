import { useID } from "@dothq/id";
import { EventEmitter } from "events";
import {
    action,
    computed,
    makeObservable,
    observable
} from "mobx";
import { dot } from ".";
import L10n from "../core/l10n";
import {
    AppConstants,
    Cc,
    ChromeUtils,
    Ci
} from "../modules";
import { commands } from "../shared/commands";

const { NetUtil } = ChromeUtils.import(
    "resource://gre/modules/NetUtil.jsm"
);

export class UtilitiesAPI extends EventEmitter {
    private _pageStatusEl =
        document.getElementById("page-status");

    @observable
    public canPopupAutohide: boolean = true;

    @observable
    public availableLanguages: string[] = [];

    public ftl: { [key: string]: any } = {};

    @computed
    public get pageStatus() {
        if (!this._pageStatusEl) return "";
        return this._pageStatusEl.innerText;
    }

    public set pageStatus(value: string) {
        if (this._pageStatusEl) {
            this._pageStatusEl.style.opacity =
                value.length == 0 ? "0" : "1";
            this._pageStatusEl.innerText = value;
        }
    }

    @computed
    public get platform() {
        return AppConstants.platform == "macosx"
            ? "macos"
            : AppConstants.platform == "win"
            ? "windows"
            : AppConstants.platform;
    }

    @computed
    public get browserLanguage() {
        try {
            const definedLang = dot.prefs.get("dot.ui.locale", "") as string;

            if(
                definedLang && 
                definedLang.length
            ) {
                const localeRegex = /^([a-z]{2})(-[A-Z]{2})?$/;
                const match = definedLang.match(localeRegex);

                if(match && match[0] && match[0] == definedLang) {
                    return definedLang;
                }
            }

            const systemLocales = Cc["@mozilla.org/intl/ospreferences;1"]
                .getService(Ci.mozIOSPreferences).systemLocales;

            return systemLocales[0];
        } catch(e) {
            return L10n.defaultLocale;
        }
    }

    @computed
    public get linuxDesktopEnvironment() {
        if (this.platform !== "linux") return "";

        return this.getEnv("XDG_CURRENT_DESKTOP");
    }

    @action
    public fetchLocale(locale: string) {
        return new Promise((resolve, reject) => {
            NetUtil.asyncFetch(
                {
                    uri: `chrome://dot/content/build/${locale}.ftl`,
                    loadUsingSystemPrincipal: true
                },
                (inputStream: any, status: any) => {
                    try {
                        const data: string =
                            NetUtil.readInputStreamToString(
                                inputStream,
                                inputStream.available(),
                                { charset: "utf-8" }
                            );

                        resolve(data);
                    } catch (e) {
                        console.error(e);
                        reject(null);
                    }
                }
            );
        });
    }

    @action
    public doCommand(command: string) {
        return commands[command]();
    }

    public onPageStatusChanged(status: string) {
        this.pageStatus = status;
    }

    @action
    public isJSON(data: any) {
        if (typeof data == "object") return true;

        let jsonParsed;

        try {
            jsonParsed = JSON.parse(data);
        } catch (e) {}

        // is JSON
        if (
            typeof data == "string" &&
            jsonParsed &&
            typeof jsonParsed == "object"
        ) {
            // return early
            return true;
        } else {
            return false;
        }
    }

    @action
    public getEnv(name: string) {
        const env = Cc[
            "@mozilla.org/process/environment;1"
        ].getService(Ci.nsIEnvironment);

        return env.get(name);
    }

    @action
    public makeID(rounds?: number) {
        return useID(rounds || 4);
    }

    constructor() {
        super();

        makeObservable(this);

        this.on(
            "page-status-changed",
            this.onPageStatusChanged
        );
    }
}
