import React from "react";
import { dot } from "../../api";
import { ipc } from "../../core/ipc";
import { SiteIdentityDialog } from "../../core/site-identity";
import { Identity } from "../Identity";
import { SearchbarInput } from "../SearchbarInput";

interface State {
    // 0: normal
    // 1: hovered
    // 2: focused
    mouseState: 0 | 1 | 2;
    isEmpty: boolean;
    identityDialogOpen: boolean;
    identityIcon: string;
    identityMsg: string;
}

interface Props {
    tabId: number
}

export class Searchbar extends React.Component<Props> {
    public state: State = {
        mouseState: 0,
        isEmpty: true,
        identityDialogOpen: false,
        identityIcon: "",
        identityMsg: ""
    }

    public identityDialog = new SiteIdentityDialog();

    public get tab() {
        return dot.tabs.get(this.props.tabId);
    }

    public onLocationChange() {
        const strings: any = this.tab?.identityManager.getIdentityStrings();

        if (strings) {
            this.setState({
                ...this.state,
                identityIcon: strings.icon || "",
                identityMsg: strings.msg || "",
            });
        }
    }

    public constructor(props: Props) {
        super(props);
    }

    public onIdentityClick() {
        if (this.identityDialog.opened) {
            this.setState({ ...this.state, identityDialogOpen: false });

            return this.identityDialog.close();
        }

        this.identityDialog.openAtElement(
            document.getElementById("identity-icon-box"),
            { tab: this.tab }
        );

        this.setState({
            ...this.state,
            identityDialogOpen: true,
        });
    }

    public componentDidMount() {
        this.onLocationChange();

        ipc.on(
            `location-change`,
            (event: any) => {
                this.onLocationChange()
            }
        );
    }

    public render() {
        return (
            <div id={"urlbar"}>
                <div
                    id={"urlbar-background"}
                    data-hovered={this.state.mouseState == 1}
                    data-focused={this.state.mouseState == 2}
                ></div>

                <div id={"urlbar-input-container"}>
                    <div id={"identity-box"}>
                        <Identity
                            onClick={() => this.onIdentityClick()}
                            selected={this.state.identityDialogOpen}
                            type={this.state.identityIcon}
                            title={this.state.identityIcon}
                        />
                    </div>

                    <div
                        id={"urlbar-input"}
                    >
                        {this.tab && <SearchbarInput tabId={this.tab.id} />}
                    </div>
                </div>
            </div>
        )
    }
}