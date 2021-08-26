import hotkeys from "hotkeys-js";
import { dot } from ".";
import { store } from "../app/store";
import { Key } from "../menus/hotkey";
import { zoomManager } from "../services/zoom";

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

        // Close Tab
        this.addKeybind(["Ctrl", "W"], () => {
            dot.tabs.selectedTab?.destroy();
        });

        // Reload
        this.addKeybind(["Ctrl", "R"], () => {
            dot.utilities.doCommand("Browser:Reload")
        });

        // Back
        this.addKeybind(["Alt", "ArrowLeft"], () => {
            dot.utilities.doCommand("Browser:GoBack")
        });

        // Forward
        this.addKeybind(["Alt", "ArrowRight"], () => {
            dot.utilities.doCommand("Browser:GoForward")
        });

        // Esc
        this.addKeybind(["Esc"], () => {
            if (dot.menus.visibleMenu) return dot.menus.clear();

            if (dot.tabs.selectedTab?.state == "loading") {
                dot.utilities.doCommand("Browser:Stop")
            }
        });

        // Zoom In
        this.addKeybind(["Ctrl", "="], () => {
            zoomManager.enlarge();
        });

        // Zoom Out
        this.addKeybind(["Ctrl", "-"], () => {
            zoomManager.reduce();
        });

        // Zoom Reset
        this.addKeybind(["Ctrl", "0"], () => {
            zoomManager.reset();
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