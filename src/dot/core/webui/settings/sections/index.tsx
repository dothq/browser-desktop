import { ComponentType } from "react";

export abstract class Section {
    public abstract id: string;
    public abstract name: string;
    public abstract icon: string;
    public reducer: any;

    public abstract children: {
        title: string;
        element: ComponentType;
    }[];

    protected _visible?: () => boolean;

    public get visible() {
        if (!this._visible) return true;
        return this._visible();
    }
}
