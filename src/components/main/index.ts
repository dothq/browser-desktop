/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { configure } from "mobx";
import { createElement } from "react";
import { render } from "react-dom";
import CustomisableUI from "../customise";
import Application from "./Application";

export const ROOT_EL = document.getElementById("app");

export class Browser {
	public customisable: CustomisableUI = new CustomisableUI();

	public init() {
		// Configure MobX state
		configure({
			enforceActions: "never",
		});

		// Initialise vital services
		this.customisable.init();

		render(createElement(Application), ROOT_EL);

		console.log("gBrowser: init");
	}
}

// Create a singleton
const instance = new Browser();

window._gBrowser = instance;
export default instance;
