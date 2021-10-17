import { useID } from "@dothq/id";
import { dot } from ".";
import { store } from "../app/store";
import { zoomManager } from "../services/zoom";

export enum keys {
    VK_CANCEL = "VK_HELP",
    VK_HELP = "VK_HELP",
    VK_BACK_SPACE = "VK_BACK_SPACE",
    VK_TAB = "VK_TAB",
    VK_CLEAR = "VK_CLEAR",
    VK_RETURN = "VK_RETURN",
    VK_SHIFT = "VK_SHIFT",
    VK_CONTROL = "VK_CONTROL",
    VK_ALT = "VK_ALT",
    VK_PAUSE = "VK_PAUSE",
    VK_CAPS_LOCK = "VK_CAPS_LOCK",
    VK_ESCAPE = "VK_ESCAPE",
    VK_SPACE = "VK_SPACE",
    VK_PAGE_UP = "VK_PAGE_UP",
    VK_PAGE_DOWN = "VK_PAGE_DOWN",
    VK_END = "VK_END",
    VK_HOME = "VK_HOME",
    VK_LEFT = "VK_LEFT",
    VK_UP = "VK_UP",
    VK_RIGHT = "VK_RIGHT",
    VK_DOWN = "VK_DOWN",
    VK_PRINTSCREEN = "VK_PRINTSCREEN",
    VK_INSERT = "VK_INSERT",
    VK_DELETE = "VK_DELETE",
    VK_0 = "VK_0",
    VK_1 = "VK_1",
    VK_2 = "VK_2",
    VK_3 = "VK_3",
    VK_4 = "VK_4",
    VK_5 = "VK_5",
    VK_6 = "VK_6",
    VK_7 = "VK_7",
    VK_8 = "VK_8",
    VK_9 = "VK_9",
    VK_SEMICOLON = "VK_SEMICOLON",
    VK_EQUALS = "VK_EQUALS",
    VK_A = "VK_A",
    VK_B = "VK_B",
    VK_C = "VK_C",
    VK_D = "VK_D",
    VK_E = "VK_E",
    VK_F = "VK_F",
    VK_G = "VK_G",
    VK_H = "VK_H",
    VK_I = "VK_I",
    VK_J = "VK_J",
    VK_K = "VK_K",
    VK_L = "VK_L",
    VK_M = "VK_M",
    VK_N = "VK_N",
    VK_O = "VK_O",
    VK_P = "VK_P",
    VK_Q = "VK_Q",
    VK_R = "VK_R",
    VK_S = "VK_S",
    VK_T = "VK_T",
    VK_U = "VK_U",
    VK_V = "VK_V",
    VK_W = "VK_W",
    VK_X = "VK_X",
    VK_Y = "VK_Y",
    VK_Z = "VK_Z",
    VK_CONTEXT_MENU = "VK_CONTEXT_MENU",
    VK_NUMPAD0 = "VK_NUMPAD0",
    VK_NUMPAD1 = "VK_NUMPAD1",
    VK_NUMPAD2 = "VK_NUMPAD2",
    VK_NUMPAD3 = "VK_NUMPAD3",
    VK_NUMPAD4 = "VK_NUMPAD4",
    VK_NUMPAD5 = "VK_NUMPAD5",
    VK_NUMPAD6 = "VK_NUMPAD6",
    VK_NUMPAD7 = "VK_NUMPAD7",
    VK_NUMPAD8 = "VK_NUMPAD8",
    VK_NUMPAD9 = "VK_NUMPAD9",
    VK_MULTIPLY = "VK_MULTIPLY",
    VK_ADD = "VK_ADD",
    VK_SEPARATOR = "VK_SEPARATOR",
    VK_SUBTRACT = "VK_SUBTRACT",
    VK_DECIMAL = "VK_DECIMAL",
    VK_DIVIDE = "VK_DIVIDE",
    VK_F1 = "VK_F1",
    VK_F2 = "VK_F2",
    VK_F3 = "VK_F3",
    VK_F4 = "VK_F4",
    VK_F5 = "VK_F5",
    VK_F6 = "VK_F6",
    VK_F7 = "VK_F7",
    VK_F8 = "VK_F8",
    VK_F9 = "VK_F9",
    VK_F10 = "VK_F10",
    VK_F11 = "VK_F11",
    VK_F12 = "VK_F12",
    VK_F13 = "VK_F13",
    VK_F14 = "VK_F14",
    VK_F15 = "VK_F15",
    VK_F16 = "VK_F16",
    VK_F17 = "VK_F17",
    VK_F18 = "VK_F18",
    VK_F19 = "VK_F19",
    VK_F20 = "VK_F20",
    VK_F21 = "VK_F21",
    VK_F22 = "VK_F22",
    VK_F23 = "VK_F23",
    VK_F24 = "VK_F24",
    VK_NUM_LOCK = "VK_NUM_LOCK",
    VK_SCROLL_LOCK = "VK_SCROLL_LOCK",
    VK_COMMA = "VK_COMMA",
    VK_PERIOD = "VK_PERIOD",
    VK_SLASH = "VK_SLASH",
    VK_BACK_QUOTE = "VK_BACK_QUOTE",
    VK_OPEN_BRACKET = "VK_OPEN_BRACKET",
    VK_BACK_SLASH = "VK_BACK_SLASH",
    VK_CLOSE_BRACKET = "VK_CLOSE_BRACKET",
    VK_QUOTE = "VK_QUOTE",
    VK_META = "VK_META",
    VK_COLON = "VK_COLON",
    VK_VOLUME_MUTE = "VK_VOLUME_MUTE",
    VK_VOLUME_DOWN = "VK_VOLUME_DOWN",
    VK_VOLUME_UP = "VK_VOLUME_UP",
}

export class KeybindsAPI {
    public initted: boolean = false;
    public bindMap: any = {};

    public get browserKeyset() {
        return document.getElementById("browser-keyset");
    }

    public get browserCommandset() {
        return document.getElementById("browser-cmdset");
    }

    public specialKeys = [
        "accel",
        "alt",
        "super",
        "shift"
    ]

    public addKeybind(
        keys: string[],
        callback: (event: KeyboardEvent) => void
    ) {
        const id = `${useID(1)}`;

        const key = document.createXULElement("key");
        const command = document.createXULElement("command");

        command.setAttribute("id", `cmd_${id}`);
        command.addEventListener("command", (e: any) => callback(e), true);
        command.setAttribute("oncommand", "void 0;");

        this.browserCommandset?.prepend(command);

        const mozKeys = keys
            .filter(key => !this.specialKeys.includes(key))
            .join(",");

        const mozModKeys = keys
            .filter(key => !mozKeys.includes(key))
            .join(",");

        key.setAttribute("id", `key_${id}`);
        key.setAttribute("key", mozKeys);
        key.setAttribute("modifiers", mozModKeys);
        key.setAttribute("command", `cmd_${id}`);
        key.setAttribute("oncommand", "void 0;");

        this.browserKeyset?.prepend(key);

        return key;
    }

    constructor() {
        // New Tab
        this.addKeybind(["accel", keys.VK_T], () => {
            dot.utilities.doCommand("Browser:NewTab");
        });

        // Close Tab
        this.addKeybind(["accel", keys.VK_W], () => {
            dot.tabs.selectedTab?.destroy();
        });

        // Reload
        this.addKeybind(["accel", keys.VK_R], () => {
            dot.utilities.doCommand("Browser:Reload");
        });

        // Back
        this.addKeybind(["alt", keys.VK_T], () => {
            dot.utilities.doCommand("Browser:GoBack");
        });

        // Forward
        this.addKeybind(["alt", keys.VK_RIGHT], () => {
            dot.utilities.doCommand("Browser:GoForward");
        });

        // Esc
        this.addKeybind([keys.VK_ESCAPE], () => {
            if (dot.menus.visibleMenu)
                return dot.menus.clear();

            if (
                dot.tabs.selectedTab?.state == "loading"
            ) {
                dot.utilities.doCommand("Browser:Stop");
            }
        });

        // Zoom In
        this.addKeybind(["accel", keys.VK_EQUALS], () => {
            zoomManager.enlarge();
        });

        // Zoom Out
        this.addKeybind(["accel", keys.VK_SUBTRACT], () => {
            zoomManager.reduce();
        });

        // Zoom Reset
        this.addKeybind(["accel", keys.VK_0], () => {
            zoomManager.reset();
        });

        // Toggle Launcher
        this.addKeybind(["accel", keys.VK_SPACE], () => {
            store.dispatch({
                type: "UI_TOGGLE_LAUNCHER",
                payload:
                    !store.getState().ui.launcherVisible
            });
        });
    }
}
