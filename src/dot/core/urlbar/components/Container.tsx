import { observer } from "mobx-react";
import React from "react";

export interface UrlbarContainerProps {
    children: any;
}

@observer
export class UrlbarContainer extends React.Component<UrlbarContainerProps> {
    public constructor(props: UrlbarContainerProps) {
        super(props);
    }

    public render() {
        return (
            <div id={"urlbar"}>
                {this.props.children}
            </div>
        )
    }
}