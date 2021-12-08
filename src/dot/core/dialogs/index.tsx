import { render } from "preact";
import React from "react";
import ReactDOM from "react-dom";
import { dot } from "../../api";
import { PopupDialog } from "./dialog";

export class UIDialog {
    public currentScreen: number = -1;
    private screens: {
        [key: string]: () => JSX.Element;
    } = {};
    private renderedTo: HTMLDivElement | Element | null =
        null;

    public get opened() {
        return !!this.renderedTo;
    }

    public registerScreen(
        id: number,
        element: (...args: any) => JSX.Element
    ) {
        this.screens[id] = element;
    }

    public open(x: number, y: number, ctx?: any) {
        const box = document.createElement("div");

        box.style.position = "absolute";
        box.style.width = "100%";
        box.style.height = "100%";
        box.style.top = "0";
        box.style.left = "0";
        box.style.zIndex = "999999999999999999999";

        if (screen) {
            render(
                <PopupDialog
                    x={x}
                    y={y}
                    ctx={ctx}
                    screens={this.screens}
                    initialScreen={this.currentScreen}
                />,
                box
            );

            document
                .getElementById("browser-popups")
                ?.appendChild(box);
            this.renderedTo = box;

            this.renderedTo.addEventListener(
                "mousedown",
                (e: any) => {
                    if (!dot.utilities.canPopupAutohide)
                        return;

                    if (
                        this.renderedTo &&
                        !this.renderedTo?.childNodes[0].contains(
                            e.target
                        )
                    ) {
                        (
                            this
                                .renderedTo as HTMLDivElement
                        ).style.opacity = "0";
                    }
                }
            );

            this.renderedTo.addEventListener(
                "mouseup",
                (e: any) => {
                    if (
                        !this.renderedTo?.childNodes[0].contains(
                            e.target
                        )
                    ) {
                        this.close();
                    }
                }
            );
        }
    }

    public openAtElement(
        element: HTMLElement | null,
        ctx?: any
    ) {
        if (element) {
            const bounds =
                element.getBoundingClientRect();

            this.open(
                bounds.x,
                bounds.y + bounds.height,
                ctx
            );
        }
    }

    public close() {
        if (!dot.utilities.canPopupAutohide) return;

        if (this.renderedTo) {
            ReactDOM.unmountComponentAtNode(
                this.renderedTo as Element
            );
            this.renderedTo.outerHTML = "";
            this.renderedTo = null;
        }
    }
}
