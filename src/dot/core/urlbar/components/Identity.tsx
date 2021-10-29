import { observer } from "mobx-react";
import React from "react";
import { dot } from "../../../api";
import { SearchbarButton } from "../../../components/SearchbarButton";

@observer
export class UrlbarIdentity extends React.Component {
    public constructor(props: any) {
        super(props);
    }

    public getIdentityClassName() {
        const tab = dot.tabs.selectedTab;
        if(!tab) return;

        if(tab.urlbarValue) return "search";
        else return tab.identityManager.getIdentityStrings().icon;
    }

    public render() {
        return (
            <div id={"urlbar-identity-box"}>
                <SearchbarButton
                    id={"identity-icon-box"}
                    className={this.getIdentityClassName()}
                />
            </div>
        )
    }
}