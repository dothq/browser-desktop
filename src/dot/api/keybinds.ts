import hotkeys from "hotkeys-js";
import { dot } from ".";
import { store } from "../app/store";
import { Key } from "../menus/hotkey";

export class KeybindsAPI {
    public initted: boolean = false;
    public bindMap: any = {};

    public addKeybind(keys: Key[], callback: (event: KeyboardEvent) => void) {
        hotkeys(keys.join("+"), callback);
    }

    constructor() {
        // New Tab
        this.addKeybind(["Ctrl", "T"], () => {
            dot.utilities.doCommand("Browser:NewTab")
        });

        // Toggle Launcher
        this.addKeybind(["Ctrl", "Space"], () => {
            store.dispatch({
                type: "UI_TOGGLE_LAUNCHER",
                payload: !store.getState().ui.launcherVisible
            })
        });
    }
}