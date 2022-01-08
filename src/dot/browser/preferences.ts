import { Browser } from "index";
import { Services } from "mozilla";

export class BrowserPreferences {
    public get(id: string, defaultValue?: any) {
        const type = this.getMozType(id);

        const func =
            type == "bool"
                ? "getBoolPref"
                : type == "int"
                ? "getIntPref"
                : "getStringPref";

        let value;

        try {
            value = Services.prefs[func](id);
        } catch (e) {
            return defaultValue;
        }

        return type == "bool"
            ? Boolean(value)
            : type == "int"
            ? parseInt(value)
            : this.browser.utilities.isJSON(value) == true
            ? JSON.parse(value)
            : value.toString();
    }

    public set(
        id: string,
        data: string | number | boolean | object
    ) {
        if (data == undefined)
            throw new Error("Payload must be set.");

        const oldData = this.get(id);

        if (oldData == data) return;

        let type = this.getType(id, data);
        let payload = data;

        // JSON payloads
        if (type == "json") {
            type = "str";
            payload = JSON.stringify(data);
        }

        const func =
            type == "bool"
                ? "setBoolPref"
                : type == "int"
                ? "setIntPref"
                : type == "str"
                ? "setStringPref"
                : undefined;

        if (!func)
            throw new Error(
                "Unable to work out type from payload."
            );

        Services.prefs[func](id, payload);

        return {
            id,
            type: this.browser.utilities.isJSON(data)
                ? "json"
                : typeof data,
            data,
            diff: [oldData, data]
        };
    }

    public delete(id: string) {
        Services.prefs.clearUserPref(id);

        const data = this.get(id);
        return typeof data == "undefined";
    }

    public getBranch(id: string) {
        if (!id.endsWith(".")) id = `${id}.`;

        const branch = Services.prefs.getBranch(id);
        const ids = branch.getChildList("");

        return ids;
    }

    public observe(
        id: string,
        callback: (...args: any[]) => void,
        immediate?: boolean
    ) {
        const observerCallback = (
            ...observerArgs: any[]
        ) => {
            const newValue = this.get(id);

            return callback(newValue, ...observerArgs);
        };

        if (immediate && immediate == true)
            observerCallback([]);

        Services.prefs.addObserver(id, observerCallback);
    }

    public getType(id: string, initialData?: any) {
        const data = initialData
            ? initialData
            : this.get(id);
        const dataType = typeof data;

        if (
            this.browser.utilities.isJSON(data) ||
            dataType == "object"
        )
            return "json";

        return dataType == "string"
            ? "str"
            : dataType == "number"
            ? "int"
            : dataType == "boolean"
            ? "bool"
            : undefined;
    }

    private getMozType(id: string) {
        const rawType = Services.prefs.getPrefType(id);

        switch (rawType) {
            case Services.prefs.PREF_BOOL:
                return "bool";
            case Services.prefs.PREF_INT:
                return "int";
            case Services.prefs.PREF_STRING:
                return "str";
            default:
                return undefined;
        }
    }

    public constructor(private browser: Browser) {}
}
