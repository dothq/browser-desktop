// import EventEmitter from "events";
// import { dot } from "../../api";
// import { AppConstants } from "../../modules";
// import { keyCodeBindings, vkMappings } from "./mapping";

// interface DotKeyboardEvent extends KeyboardEvent {
//     readonly altKey: boolean;
//     char: string;
//     readonly charCode: number;
//     readonly code: string;
//     readonly ctrlKey: boolean;
//     readonly isComposing: boolean;
//     readonly key: string;
//     readonly keyCode: number;
//     readonly location: number;
//     readonly metaKey: boolean;
//     readonly repeat: boolean;
//     readonly shiftKey: boolean;
//     getModifierState(keyArg: string): boolean;
//     readonly DOM_KEY_LOCATION_LEFT: number;
//     readonly DOM_KEY_LOCATION_NUMPAD: number;
//     readonly DOM_KEY_LOCATION_RIGHT: number;
//     readonly DOM_KEY_LOCATION_STANDARD: number;
// }

// export class KeyboardShortcuts extends EventEmitter {
//     public window: Window;

//     public keys = new Map();
//     public shortcutListeners = new Map();

//     private initted: boolean = false;

//     public ALT_KEY = "Alt";
//     public SHIFT_KEY = "Shift";

//     public COMMAND_OR_CONTROL_KEY = "CommandOrControl";
//     public CMD_OR_CTRL_KEY = "CmdOrCtrl";

//     public CONTROL_KEY = "Control";
//     public CTRL_KEY = "Ctrl";

//     // macOS only keys
//     public COMMAND_KEY = "Command";
//     public COMMAND_SHORT_KEY = "Cmd";

//     public onKeyDown(event: DotKeyboardEvent) {
//         if (!this.initted) return;

//         for (const [key, data] of this.keys) {
//             console.log(key);

//             if (
//                 data.meta !== event.metaKey ||
//                 data.ctrl !== event.ctrlKey ||
//                 data.alt !== event.altKey
//             )
//                 return;

//             if(data.shift !== event.shiftKey) {
//                 const char = String.fromCharCode(event.keyCode);

//                 let isAlphabetical = Boolean(
//                     char.length == 1 &&
//                     char.match(/[a-zA-Z]/)
//                 );

//                 if(!isAlphabetical) isAlphabetical = Boolean(
//                     event.key &&
//                     event.key.match(/[a-zA-Z]/)
//                 );

//                 const isCmd = data.meta && !data.alt && !data.ctrl;

//                 if (
//                     isAlphabetical ||
//                     isCmd
//                 ) return;
//             }

//             let isValidKey = false;

//             if (data.keyCode) {
//                 isValidKey =
//                     event.keyCode == data.keyCode;
//             } else if (event.key in vkMappings) {
//                 isValidKey =
//                     vkMappings[event.key] == data.key;
//             } else {
//                 const key =
//                     event.key ||
//                     String.fromCharCode(event.keyCode);

//                 isValidKey =
//                     key.toLowerCase() == data.key ||
//                     (data.key.match(/[0-9]/) &&
//                         event.keyCode ==
//                             data.key.charCodeAt(0));
//             }

//             if (!isValidKey) return;

//             this.emit(key, event);
//         }
//     }

//     public parseAsElectronKey(keybind: string) {
//         const modifiers = keybind.split("+");
//         let key: any = modifiers.pop();

//         const keyData: any = {
//             ctrl: false,
//             meta: false,
//             alt: false,
//             shift: false,
//             key: undefined,
//             keyCode: undefined,
//             keyCodeString: undefined
//         };

//         for (const mod of modifiers) {
//             if (mod == this.ALT_KEY) {
//                 keyData.alt = true;
//             } else if (
//                 mod == this.COMMAND_KEY ||
//                 mod == this.COMMAND_SHORT_KEY
//             ) {
//                 keyData.meta = true;
//             } else if (
//                 mod == this.COMMAND_OR_CONTROL_KEY ||
//                 mod == this.CMD_OR_CTRL_KEY
//             ) {
//                 if (AppConstants.platform == "macosx") {
//                     keyData.meta = true;
//                 } else {
//                     keyData.ctrl = true;
//                 }
//             } else if (
//                 mod == this.CONTROL_KEY ||
//                 mod == this.CTRL_KEY
//             ) {
//                 keyData.ctrl = true;
//             } else if (mod == this.SHIFT_KEY) {
//                 keyData.shift = true;
//             } else {
//                 console.warn(
//                     `Unrecognised modifier '${mod}'.`
//                 );
//             }
//         }

//         if (key == "Plus") key = "+";

//         if (typeof key == "string" && key.length == 1) {
//             if (keyData.alt) {
//                 keyData.keyCode =
//                     keyCodeBindings[
//                         `DOM_VK_${key.toUpperCase()}`
//                     ];
//                 keyData.keyCodeString = key;
//             } else {
//                 keyData.key = key.toLowerCase();
//             }
//         } else if (key in vkMappings) {
//             key = vkMappings[key];

//             keyData.keyCode = keyCodeBindings[key];
//             keyData.keyCodeString = Object.keys(
//                 vkMappings
//             ).find((k) => vkMappings[k] == key);
//             keyData.key = key;
//         } else {
//             console.warn(`Unrecognised key '${key}'.`);
//         }

//         return keyData;
//     }

//     public register(
//         key: string,
//         listener: (...args: any[]) => void
//     ) {
//         if (!this.keys.has(key)) {
//             const shortcut = this.parseAsElectronKey(key);

//             if (shortcut) {
//                 this.keys.set(key, shortcut);
//                 this.shortcutListeners.set(key, listener);

//                 super.on(key, listener);
//             }
//         }
//     }

//     public registerByPrefId(
//         prefId: string,
//         listener: (...args: any[]) => void
//     ) {
//         const key = dot.prefs.get(
//             `dot.keybinds.${prefId}`
//         );

//         if (key) {
//             return this.register(key, listener);
//         } else {
//             console.warn(
//                 `Keybind not set for 'dot.keybinds.${prefId}', ignoring...`
//             );
//         }
//     }

//     public unregister(key: string) {
//         const listener = this.shortcutListeners.get(key);

//         if (listener) {
//             this.off(key, listener);
//             this.shortcutListeners.delete(key);
//         }

//         this.keys.delete(key);
//     }

//     public unregisterAll() {
//         this.shortcutListeners.forEach(
//             (listener, key: string) => {
//                 this.off(key, listener);
//                 this.shortcutListeners.delete(key);
//             }
//         );

//         this.keys.forEach((_, key: string) => {
//             this.keys.delete(key);
//         });
//     }

//     public toString(keybind: string) {
//         try {
//             const parsed =
//                 this.parseAsElectronKey(keybind);

//             const list = [];

//             if (parsed.alt) list.push("Alt");
//             if (parsed.ctrl) list.push("Ctrl");
//             if (parsed.meta) list.push("Cmd");
//             if (parsed.shift) list.push("Shift");

//             const key = parsed.keyCodeString
//                 ? parsed.keyCodeString
//                 : parsed.key.toUpperCase();

//             list.push(key);

//             return list.join("+");
//         } catch (e) {
//             console.warn(e);

//             return keybind;
//         }
//     }

//     public init() {
//         this.unregisterAll();

//         const keybinds = dot.prefs.getBranch(
//             "dot.keybinds."
//         );
//         const components = Object.values(
//             dot.menus.components
//         ).map(
//             (x: any) =>
//                 new x({
//                     tabId: dot.tabs.selectedTabId
//                 })
//         ); // maybe add some context in future?

//         for (const key of keybinds) {
//             const match = components.find(
//                 (x) => x.id == key
//             );

//             if (match) {
//                 this.registerByPrefId(key, match.onClick);
//             }
//         }

//         this.initted = true;
//     }

//     public constructor(window: Window) {
//         super();

//         this.window = window;
//         this.window.addEventListener(
//             "keydown",
//             (event: any) => this.onKeyDown.bind(this)(event)
//         );
//     }
// }
