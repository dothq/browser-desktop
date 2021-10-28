import { makeObservable, observable } from "mobx";

export class SettingsAPI {
    @observable
    public selectedSection: string = "";

    public constructor() {
        makeObservable(this);
    }
}

export const settings = new SettingsAPI();