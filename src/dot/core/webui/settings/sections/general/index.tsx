import { Section } from "..";
import { Profiles } from "./profiles";
import { generalSlice } from "./reducers";

export class General extends Section {
    public children = [
        Profiles
    ]

    public reducer = generalSlice.reducer

    public constructor() {
        super({
            id: "general",
            name: "General",
            icon: "chrome://dot/content/skin/icons/home-filled.svg"
        })
    }
}