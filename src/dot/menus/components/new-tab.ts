import { MenuItem } from ".";
import { store } from "../../app/store";
import { WELCOME_SCREEN_URL } from "../../shared/tab";
import { Hotkey } from "../hotkey";

export class NewTab extends MenuItem {
    public onClick() {
        return store.dispatch({
            type: "TAB_CREATE",
            payload: {
                url: WELCOME_SCREEN_URL
            }
        });
    }

    constructor() {
        super({
            id: "context-newtab",
            type: "item",
            category: "browser",

            label: "New Tab",
            icon: "add.svg",
            description: "Create a New Tab.",

            hotkey: new Hotkey("Ctrl", "T")
        })
    }
}