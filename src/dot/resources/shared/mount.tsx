import React from "react";
import { render } from "react-dom";

export const webUIRender = (id: string, jsxElement: React.ReactElement, callback?: () => void) => {
    const mount: HTMLElement | null = document.getElementById(id);

    if (mount) {
        mount.attachShadow({ mode: "open" });
    }

    const { shadowRoot }: any = mount;

    render(
        jsxElement,
        shadowRoot,
        callback
    );

    const styles = document.createElement("link");

    styles.rel = "stylesheet";
    styles.href = "chrome://dot/content/build/webui.chunk.css";

    mount?.shadowRoot?.appendChild(styles);
}