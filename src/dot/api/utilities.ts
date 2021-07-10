import { EventEmitter } from "events";
import { commands } from "../shared/commands";

export class UtilitiesAPI extends EventEmitter {
    private _pageStatusEl = document.getElementById("page-status");

    public get pageStatus() {
        if(!this._pageStatusEl) return "";
        return this._pageStatusEl.innerText;
    }

    public set pageStatus(value: string) {
        if(this._pageStatusEl) {
            this._pageStatusEl.style.opacity = value.length == 0 ? "0" : "1";
            this._pageStatusEl.innerText = value;
        }
    }

    public doCommand(command: string) {
        console.log(command)
        return commands[command]();
    }

    public onPageStatusChanged(status: string) {
        this.pageStatus = status;
    }

    constructor() {
        super();

        this.on("page-status-changed", this.onPageStatusChanged);
    }
}