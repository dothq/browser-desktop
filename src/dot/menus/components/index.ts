import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class MenuItem {
    public id: string = `item-${dot.utilities.makeID(2)}`;
    public type: 'item' | 'separator' | 'submenu' | 'checkbox' | 'radio' = 'item';

    private _label: string = "Item";

    public get label(): string {
        return this._label;
    }

    public set label(value: string) {
        this._label = value;
    }

    private _icon?: string | undefined;

    public get icon(): string | undefined {
        return this._icon;
    }
    public set icon(value: string | undefined) {
        this._icon = value;
    }

    public iconPrefix?: string = "chrome://dot/content/skin/icons/"
    public hotkey?: Hotkey;
    public selected?: boolean;

    public description?: string;
    public category?: string;

    constructor(args: Partial<MenuItem>) {
        for (const [key, value] of Object.entries(args)) {
            (this as any)[key] = value;
        }
    }
}