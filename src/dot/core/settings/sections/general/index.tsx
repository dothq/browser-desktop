import React from "react";
import { settings } from "../../api";

export class GeneralSection extends React.Component {
    static id = "general";
    static text = "General";
    static icon =
        "chrome://dot/content/skin/icons/home-filled.svg";

    public render() {
        return <h1>Example</h1>;
    }

    static visible() {
        return settings.selectedSection == this.id;
    }

    public constructor(props: any) {
        super(props);
    }
}
