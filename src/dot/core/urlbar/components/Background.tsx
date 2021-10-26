import { observer } from "mobx-react";
import React from "react";

@observer
export class UrlbarBackground extends React.Component {
    public constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <div id={"urlbar-background"}></div>
        )
    }
}