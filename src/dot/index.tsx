/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { configure } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import ReactDOM from "react-dom";
import { Chrome } from "./components/Chrome";
import "./core/l10n";
import { Statusbar } from "./core/statusbar";

configure({
    enforceActions: "never"
});

class ErrorBoundary extends React.Component {
    public state = {
        hasError: false,
    }

    public constructor(props: any) {
        super(props);
    }
  
    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }
    
    public render() {
        if(this.state.hasError) return <></>;

        return this.props.children; 
    }
}

export const Application = observer(() => {
    return (
        <ErrorBoundary>
            <div className={"ui-container"}>
                <Chrome />
                {/* <Launcher /> */}
                <Statusbar />
            </div>
        </ErrorBoundary>
    );
});

export const render = () =>
    ReactDOM.render(
        <Application />,
        document.getElementById("browser")
    );
