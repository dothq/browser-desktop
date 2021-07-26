import { EventEmitter } from "events";
import { AppConstants, Services } from "../modules";
import { commands } from "../shared/commands";

export class UtilitiesAPI extends EventEmitter {
    private _pageStatusEl = document.getElementById("page-status");

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
        return Services.locale.requestedLocale
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

    constructor() {
        super();

        this.on("page-status-changed", this.onPageStatusChanged);
    }
}