import { observer } from "mobx-react";
import React from "react";
import { Tab } from "../../models/Tab";
import { UrlbarBackground } from "./components/Background";
import { UrlbarContainer } from "./components/Container";
import { UrlbarIdentity } from "./components/Identity";
import { UrlbarInput } from "./components/Input";
import { UrlbarInputContainer } from "./components/InputContainer";

export interface UrlbarProps {
    tab: Tab;
}

@observer
export class Urlbar extends React.Component<UrlbarProps> {
    public constructor(props: UrlbarProps) {
        super(props);
    }

    public render() {
        return (
            <UrlbarContainer>
                <UrlbarBackground />

                <UrlbarInputContainer>
                    <UrlbarIdentity />

                    <UrlbarInput />
                </UrlbarInputContainer>
            </UrlbarContainer>
        )
    }
}