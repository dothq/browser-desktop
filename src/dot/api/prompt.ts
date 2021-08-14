import React from "react";
import ReactDOM from "react-dom";
import { dot } from ".";
import { Button } from "../components/Button";
import { Cc, Ci } from "../modules";

export class PromptAPI {
    public alert(
        type: 'window' | 'tab',
        title: string,
        message: string,
        okLabel?: string,
        cancelLabel?: string
    ) {
        return new Promise((resolve) => {
            const mount: any = document.getElementById("window-modal-mount");

            window.document.documentElement.focus();

            const rect = dot.tabs.getBrowserContainer(dot.tabs.selectedTab?.webContents)
                .getBoundingClientRect()

            const onKeyPress = (e: KeyboardEvent) => {
                if (e.key == "Escape") dispatch(false);
            };

            document.addEventListener("keypress", onKeyPress);

            const dispatch = (result: boolean) => {
                ReactDOM.unmountComponentAtNode(mount);
                document.removeEventListener("keypress", onKeyPress);
                resolve(result);
            }

            const h1 = React.createElement(
                "h1",
                {
                    className: "modal-title-text"
                },
                title
            );

            const msg = React.createElement(
                "p",
                {
                    className: "modal-body-text"
                },
                message
            );

            const okButton = React.createElement(
                Button,
                {
                    label: okLabel || "OK",
                    noFocus: true,
                    primary: true,
                    onClick: () => dispatch(true)
                }
            );

            const cancelButton = React.createElement(
                Button,
                {
                    label: cancelLabel || "Cancel",
                    noFocus: true,
                    onClick: () => dispatch(false)
                }
            );

            const buttonGroup = React.createElement(
                "div",
                {
                    className: "modal-buttons",
                },
                cancelButton,
                okButton
            )

            const container = React.createElement(
                "main",
                {
                    className: "ui-modal-dialog-container",
                    style: {
                        marginTop: (type == "window"
                            ? rect.top - 12
                            : 0) + "px",
                        borderRadius: type == "tab"
                            ? `0px 0px 18px 18px`
                            : ``
                    }
                },
                h1,
                msg,
                buttonGroup
            );

            const box = React.createElement(
                "div",
                {
                    className: "ui-modal-dialog",
                    style: {
                        zIndex: type == "tab" ? 0 : 99999999999,
                        top: (type == "tab" ? rect.top : 0) + "px"
                    },
                    "data-type": type
                },
                container
            );

            ReactDOM.render(
                box,
                mount
            );

            this.beep();
        })
    }

    private beep() {
        Cc["@mozilla.org/sound;1"]
            .createInstance(Ci.nsISound)
            .beep()
    }
}