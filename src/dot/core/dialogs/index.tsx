import React from "react";
import ReactDOM from "react-dom";
import { PopupContainer } from "./popup";

export class UIDialog {
    public currentScreen: number = -1;
    private screens: { [key: string]: () => JSX.Element } = {};
    private renderedTo: HTMLDivElement | Element | null = null;

    public get opened() {
        return !!this.renderedTo;
    }

    public registerScreen(id: number, element: (...args: any) => JSX.Element) {
        this.screens[id] = element;
    }

    public open(x: number, y: number, ctx?: any) {
        const box = document.createElement("div");

        const Screen = this.screens[this.currentScreen];

        if (screen) {
            ReactDOM.render(
                <PopupContainer x={x} y={y}>
                    <Screen {...ctx || {}} />
                </PopupContainer>,
                box
            )

            document.getElementById("mainPopupSet")?.appendChild(box);
            this.renderedTo = box;
        }
    }

    public openAtElement(element: HTMLElement | null, ctx?: any) {
        if (element) {
            const bounds = element.getBoundingClientRect();

            this.open(
                bounds.x,
                bounds.y + bounds.height,
                ctx
            );
        }
    }

    public close() {
        if (this.renderedTo) {
            ReactDOM.unmountComponentAtNode(this.renderedTo as Element);
            this.renderedTo.outerHTML = "";
            this.renderedTo = null;
        }
    }
}