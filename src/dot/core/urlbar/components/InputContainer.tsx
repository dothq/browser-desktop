import { observer } from "mobx-react";
import React from "react";

export interface UrlbarInputContainerProps {
    children: any;
}

@observer
export class UrlbarInputContainer extends React.Component<UrlbarInputContainerProps> {
    public constructor(props: UrlbarInputContainerProps) {
        super(props);
    }

    public render() {
        return (
            <div id={"urlbar-input-container"}>
                {this.props.children}
            </div>
        );
    }
}
