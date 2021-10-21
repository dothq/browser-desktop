import { makeAutoObservable } from "mobx";
import { dotToolbox } from "../services/browser-toolbox";

export class DevAPI {
    public launchBrowserToolbox() {
        dotToolbox.launch();
    }

    public constructor() {
        makeAutoObservable(this);
    }
}
