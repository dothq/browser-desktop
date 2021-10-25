import EventEmitter from "events";
import { dot } from "../../api";
import { AppConstants } from "../../modules";
 
const vkMappings: any = {
   F1: "DOM_VK_F1",
   F2: "DOM_VK_F2",
   F3: "DOM_VK_F3",
   F4: "DOM_VK_F4",
   F5: "DOM_VK_F5",
   F6: "DOM_VK_F6",
   F7: "DOM_VK_F7",
   F8: "DOM_VK_F8",
   F9: "DOM_VK_F9",
   F10: "DOM_VK_F10",
   F11: "DOM_VK_F11",
   F12: "DOM_VK_F12",
   F13: "DOM_VK_F13",
   F14: "DOM_VK_F14",
   F15: "DOM_VK_F15",
   F16: "DOM_VK_F16",
   F17: "DOM_VK_F17",
   F18: "DOM_VK_F18",
   F19: "DOM_VK_F19",
   F20: "DOM_VK_F20",
   F21: "DOM_VK_F21",
   F22: "DOM_VK_F22",
   F23: "DOM_VK_F23",
   F24: "DOM_VK_F24",
   Space: "DOM_VK_SPACE",
   Backspace: "DOM_VK_BACK_SPACE",
   Delete: "DOM_VK_DELETE",
   Insert: "DOM_VK_INSERT",
   Return: "DOM_VK_RETURN",
   Enter: "DOM_VK_RETURN",
   Up: "DOM_VK_UP",
   Down: "DOM_VK_DOWN",
   Left: "DOM_VK_LEFT",
   Right: "DOM_VK_RIGHT",
   Home: "DOM_VK_HOME",
   End: "DOM_VK_END",
   PageUp: "DOM_VK_PAGE_UP",
   PageDown: "DOM_VK_PAGE_DOWN",
   Escape: "DOM_VK_ESCAPE",
   Esc: "DOM_VK_ESCAPE",
   Tab: "DOM_VK_TAB",
   VolumeUp: "DOM_VK_VOLUME_UP",
   VolumeDown: "DOM_VK_VOLUME_DOWN",
   VolumeMute: "DOM_VK_VOLUME_MUTE",
   PrintScreen: "DOM_VK_PRINTSCREEN",
};

export const keyCodeBindings: any = {
    DOM_VK_CANCEL: 3,
    DOM_VK_HELP: 6,
    DOM_VK_BACK_SPACE: 8,
    DOM_VK_TAB: 9,
    DOM_VK_CLEAR: 12,
    DOM_VK_RETURN: 13,
    DOM_VK_SHIFT: 16,
    DOM_VK_CONTROL: 17,
    DOM_VK_ALT: 18,
    DOM_VK_PAUSE: 19,
    DOM_VK_CAPS_LOCK: 20,
    DOM_VK_ESCAPE: 27,
    DOM_VK_SPACE: 32,
    DOM_VK_PAGE_UP: 33,
    DOM_VK_PAGE_DOWN: 34,
    DOM_VK_END: 35,
    DOM_VK_HOME: 36,
    DOM_VK_LEFT: 37,
    DOM_VK_UP: 38,
    DOM_VK_RIGHT: 39,
    DOM_VK_DOWN: 40,
    DOM_VK_PRINTSCREEN: 44,
    DOM_VK_INSERT: 45,
    DOM_VK_DELETE: 46,
    DOM_VK_0: 48,
    DOM_VK_1: 49,
    DOM_VK_2: 50,
    DOM_VK_3: 51,
    DOM_VK_4: 52,
    DOM_VK_5: 53,
    DOM_VK_6: 54,
    DOM_VK_7: 55,
    DOM_VK_8: 56,
    DOM_VK_9: 57,
    DOM_VK_SEMICOLON: 59,
    DOM_VK_EQUALS: 61,
    DOM_VK_A: 65,
    DOM_VK_B: 66,
    DOM_VK_C: 67,
    DOM_VK_D: 68,
    DOM_VK_E: 69,
    DOM_VK_F: 70,
    DOM_VK_G: 71,
    DOM_VK_H: 72,
    DOM_VK_I: 73,
    DOM_VK_J: 74,
    DOM_VK_K: 75,
    DOM_VK_L: 76,
    DOM_VK_M: 77,
    DOM_VK_N: 78,
    DOM_VK_O: 79,
    DOM_VK_P: 80,
    DOM_VK_Q: 81,
    DOM_VK_R: 82,
    DOM_VK_S: 83,
    DOM_VK_T: 84,
    DOM_VK_U: 85,
    DOM_VK_V: 86,
    DOM_VK_W: 87,
    DOM_VK_X: 88,
    DOM_VK_Y: 89,
    DOM_VK_Z: 90,
    DOM_VK_CONTEXT_MENU: 93,
    DOM_VK_NUMPAD0: 96,
    DOM_VK_NUMPAD1: 97,
    DOM_VK_NUMPAD2: 98,
    DOM_VK_NUMPAD3: 99,
    DOM_VK_NUMPAD4: 100,
    DOM_VK_NUMPAD5: 101,
    DOM_VK_NUMPAD6: 102,
    DOM_VK_NUMPAD7: 103,
    DOM_VK_NUMPAD8: 104,
    DOM_VK_NUMPAD9: 105,
    DOM_VK_MULTIPLY: 106,
    DOM_VK_ADD: 107,
    DOM_VK_SEPARATOR: 108,
    DOM_VK_SUBTRACT: 109,
    DOM_VK_DECIMAL: 110,
    DOM_VK_DIVIDE: 111,
    DOM_VK_F1: 112,
    DOM_VK_F2: 113,
    DOM_VK_F3: 114,
    DOM_VK_F4: 115,
    DOM_VK_F5: 116,
    DOM_VK_F6: 117,
    DOM_VK_F7: 118,
    DOM_VK_F8: 119,
    DOM_VK_F9: 120,
    DOM_VK_F10: 121,
    DOM_VK_F11: 122,
    DOM_VK_F12: 123,
    DOM_VK_F13: 124,
    DOM_VK_F14: 125,
    DOM_VK_F15: 126,
    DOM_VK_F16: 127,
    DOM_VK_F17: 128,
    DOM_VK_F18: 129,
    DOM_VK_F19: 130,
    DOM_VK_F20: 131,
    DOM_VK_F21: 132,
    DOM_VK_F22: 133,
    DOM_VK_F23: 134,
    DOM_VK_F24: 135,
    DOM_VK_NUM_LOCK: 144,
    DOM_VK_SCROLL_LOCK: 145,
    DOM_VK_COMMA: 188,
    DOM_VK_PERIOD: 190,
    DOM_VK_SLASH: 191,
    DOM_VK_BACK_QUOTE: 192,
    DOM_VK_OPEN_BRACKET: 219,
    DOM_VK_BACK_SLASH: 220,
    DOM_VK_CLOSE_BRACKET: 221,
    DOM_VK_QUOTE: 222,
    DOM_VK_META: 224,
    DOM_VK_COLON: 58,
    DOM_VK_VOLUME_MUTE: 181,
    DOM_VK_VOLUME_DOWN: 182,
    DOM_VK_VOLUME_UP: 183
}

interface DotKeyboardEvent extends UIEvent {
    readonly altKey: boolean;
    char: string;
    readonly charCode: number;
    readonly code: string;
    readonly ctrlKey: boolean;
    readonly isComposing: boolean;
    readonly key: string;
    readonly keyCode: number;
    readonly location: number;
    readonly metaKey: boolean;
    readonly repeat: boolean;
    readonly shiftKey: boolean;
    getModifierState(keyArg: string): boolean;
    readonly DOM_KEY_LOCATION_LEFT: number;
    readonly DOM_KEY_LOCATION_NUMPAD: number;
    readonly DOM_KEY_LOCATION_RIGHT: number;
    readonly DOM_KEY_LOCATION_STANDARD: number;
}
 
export class KeyboardShortcuts extends EventEmitter {
    public window: Window;

    public keys = new Map();
    public shortcutListeners = new Map();

    private initted: boolean = false;

    public ALT_KEY = "Alt";
    public SHIFT_KEY = "Shift";

    public COMMAND_OR_CONTROL_KEY = "CommandOrControl";
    public CMD_OR_CTRL_KEY = "CmdOrCtrl";

    public CONTROL_KEY = "Control";
    public CTRL_KEY = "Ctrl";

    // macOS only keys
    public COMMAND_KEY = "Command";
    public COMMAND_SHORT_KEY = "Cmd";

    public onKeyDown(event: DotKeyboardEvent) {
        if(!this.initted) return;

        for (const [key, data] of this.keys) {
            if (
                data.meta !== event.metaKey ||
                data.ctrl !== event.ctrlKey ||
                data.alt !== event.altKey
            ) return;
    
            if(data.shift !== event.shiftKey) {
                const char = String.fromCharCode(event.keyCode);
                
                let isAlphabetical = Boolean(
                    char.length == 1 && 
                    char.match(/[a-zA-Z]/)
                );
    
                if(!isAlphabetical) isAlphabetical = Boolean(
                    event.key && 
                    event.key.match(/[a-zA-Z]/)
                );
    
                const isCmd = data.meta && !data.alt && !data.ctrl;
    
                if (
                    isAlphabetical || 
                    isCmd
                ) return;
            }
    
            let isValidKey = false;
    
            if(data.keyCode) {
                isValidKey = event.keyCode == data.keyCode;
            } else if(event.key in vkMappings) {
                isValidKey = vkMappings[event.key] == data.key;
            } else {
                const key = event.key || String.fromCharCode(event.keyCode);
    
                isValidKey = (
                    key.toLowerCase() == data.key ||
                    (
                        data.key.match(/[0-9]/) &&
                        event.keyCode == data.key.charCodeAt(0)
                    )
                );
            }
    
            if(!isValidKey) return;    

            this.emit(key, event);
        }
    }

    public parseAsElectronKey(keybind: string) {        
        const modifiers = keybind.split("+");
        let key: any = modifiers.pop();
        
        const keyData: any = {
            ctrl: false,
            meta: false,
            alt: false,
            shift: false,
            key: undefined,
            keyCode: undefined,
            keyCodeString: undefined
        };

        for(const mod of modifiers) {
            if(mod == this.ALT_KEY) {
                keyData.alt = true;
            } else if(
                mod == this.COMMAND_KEY ||
                mod == this.COMMAND_SHORT_KEY
            ) {
                keyData.meta = true;
            } else if(
                mod == this.COMMAND_OR_CONTROL_KEY ||
                mod == this.CMD_OR_CTRL_KEY
            ) {
                if(AppConstants.platform == "macosx") {
                    keyData.meta = true;
                } else {
                    keyData.ctrl = true;
                }
            } else if(
                mod == this.CONTROL_KEY ||
                mod == this.CTRL_KEY
            ) {
                keyData.ctrl = true;
            } else if(mod == this.SHIFT_KEY) {
                keyData.shift = true;
            } else {
                console.warn(`Unrecognised modifier '${mod}'.`)
            }
        }
        
        if (key == "Plus") key = "+";
        
        if (
            typeof key == "string" && 
            key.length == 1
        ) {
            if (keyData.alt) {
                keyData.keyCode = keyCodeBindings[`DOM_VK_${key.toUpperCase()}`];
                keyData.keyCodeString = key;
            } else {
                keyData.key = key.toLowerCase();
            }
        } else if (key in vkMappings) {
            key = vkMappings[key];
            
            keyData.keyCode = keyCodeBindings[key];
            keyData.keyCodeString = Object.keys(vkMappings)
                .find(k => vkMappings[k] == key);
            keyData.key = key;
        } else {
            console.warn(`Unrecognised key '${key}'.`);
        }
        
        return keyData;
    }

    public register(key: string, listener: (...args: any[]) => void) {
        if (!this.keys.has(key)) {
            const shortcut = this.parseAsElectronKey(key);

            if(shortcut) {
                this.keys.set(key, shortcut);
                this.shortcutListeners.set(key, listener);

                super.on(key, listener);
            }
        }
    }

    public registerByPrefId(prefId: string, listener: (...args: any[]) => void) {
        const key = dot.prefs.get(`dot.keybinds.${prefId}`);

        if(key) {
            return this.register(key, listener);
        } else {
            console.warn(`Keybind not set for 'dot.keybinds.${prefId}', ignoring...`);
        }
    }

    public unregister(key: string) {
        const listener = this.shortcutListeners.get(key);

        if(listener) {
            this.off(key, listener);
            this.shortcutListeners.delete(key);
        }
        
        this.keys.delete(key);
    }

    public unregisterAll() {
        this.shortcutListeners.forEach((listener, key: string) => {
            this.off(key, listener);
            this.shortcutListeners.delete(key);
        })

        this.keys.forEach((_, key: string) => {
            this.keys.delete(key);
        })
    }

    public toString(keybind: string) {
        const parsed = this.parseAsElectronKey(keybind);

        const list = [];

        if (parsed.alt) list.push("Alt");
        if (parsed.ctrl) list.push("Ctrl");
        if (parsed.meta) list.push("Cmd");
        if (parsed.shift) list.push("Shift");

        const key = parsed.keyCodeString 
            ? parsed.keyCodeString
            : parsed.key.toUpperCase();

        list.push(key);
        
        return list.join("+");
    }

    public init() {
        this.unregisterAll();

        const keybinds = dot.prefs.getBranch("dot.keybinds.");
        const components = Object.values(dot.menus.components)
            .map((x: any) => new x({
                tabId: dot.tabs.selectedTabId
            })); // maybe add some context in future?

        for(const key of keybinds) {
            const match = components.find(x => x.id == key);

            if(match) {
                this.registerByPrefId(
                    key,
                    match.onClick
                )
            }
        }

        this.initted = true;
    }

    public constructor(window: Window) {
        super();

        this.window = window;
        this.window.addEventListener("keydown", this.onKeyDown.bind(this));
    }
}