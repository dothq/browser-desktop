import React from "react";
import { kHomeFilledIcon } from "../../../icons";
import { settings } from "../../api";

export class GeneralSection extends React.Component {
    static id = "general";
    static text = "General";
    static icon =
        kHomeFilledIcon;

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
