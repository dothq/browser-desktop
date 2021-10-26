import { observer } from "mobx-react";
import React from "react";
import { SearchbarButton } from "../../../components/SearchbarButton";

@observer
export class UrlbarIdentity extends React.Component {
    public constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <div id={"urlbar-identity-box"}>
                <SearchbarButton
                    id={"identity-icon-box"}
                    className={"search"}
                />
            </div>
        )
    }
}