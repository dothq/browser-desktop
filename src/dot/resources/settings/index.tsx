import React from "react";
import { render } from "react-dom";
import { Settings } from "./root";

const mount: any = document.getElementById("settings");

mount?.attachShadow({ mode: "open" })

render(
    <Settings />,
    mount?.shadowRoot
);