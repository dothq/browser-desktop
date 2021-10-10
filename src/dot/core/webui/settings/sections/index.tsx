export class Section {
    public id: string;
    public name: string;
    public icon: string;
    public reducer: any;

    public children?: any[];

    private _visible?: () => boolean;

    public get visible() {
        if (!this._visible) return true;
        return this._visible();
    }

    public constructor(props: {
        id: string;
        name: string;
        icon: string;
        visible?: () => boolean;
    }) {
        this.id = props.id;
        this.name = props.name;
        this.icon = props.icon;

        this._visible = props.visible;
    }
}
