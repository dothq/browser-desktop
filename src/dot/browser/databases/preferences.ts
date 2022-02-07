import BrowserDatabase from ".";

class BrowserPreferencesStorage extends BrowserDatabase {
    public constructor() {
        super("preferences");
    }
}

export default BrowserPreferencesStorage;
