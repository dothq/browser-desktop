import { makeAutoObservable } from "mobx";

export class PreferencesAPI {
    public constructor() {
        makeAutoObservable(this);
    }
}
