import React from "react";
import { render } from "react-xul";

import App from "./App";

import "./index.css";

render(<App />, document.getElementById("root") as HTMLElement);
