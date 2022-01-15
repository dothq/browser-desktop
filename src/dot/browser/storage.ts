import { Browser } from "index";
import BrowserPreferencesStorage from "./databases/preferences";

class BrowserStorage {
    public preferences = new BrowserPreferencesStorage();

    public async connect() {
        await this.preferences.openConnection();
    }

    public constructor(private browser: Browser) {}
}

export default BrowserStorage;