/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomizableUIWidgetDisplay } from "../../CustomizableUIWidgets.js";
import { applyConfig, CustomizableUIWidgetProps } from "../index.js";
import Widget from "./index.js";

class ToolbarButtonLabel extends MozHTMLElement {
	public get value() {
		return this.textContent;
	}

	public set value(newValue: string) {
		this.textContent = newValue;
	}

	constructor() {
		super();
	}
}

customElements.define("toolbar-button-label", ToolbarButtonLabel);

class ToolbarButtonWidget extends Widget {
	/**
	 * Grabs the label element from the DOM
	 * This will be null if the ToolbarButton isn't mounted yet
	 */
	private get _labelEl() {
		return this.querySelector(".toolbarbutton-text") as ToolbarButtonLabel;
	}

	/**
	 * Icon URI to use for ToolbarButton
	 */
	public get icon() {
		return this.style.getPropertyValue("--toolbar-button-icon").split("url(")[1].split(")")[0];
	}

	/**
	 * Updates the Icon URI used for ToolbarButton
	 */
	public set icon(newValue: string) {
		this.style.setProperty("--toolbar-button-icon", `url(${newValue})`);
	}

	/**
	 * Label to use for ToolbarButton
	 */
	public get label() {
		return this.getAttribute("label");
	}

	/**
	 * Updates the ToolbarButton's label
	 */
	public set label(newValue: string) {
		this.setAttribute("label", newValue);
		if (this._labelEl) this._labelEl.value = newValue;
	}

	/**
	 * Tooltip text to use for ToolbarButton
	 */
	public tooltipText: string = "";

	/**
	 * Keybind to use to run command of ToolbarButton
	 */
	public keybind: string = "";

	public render() {
		this.label = this.getAttribute("label");

		return (
			<fragment>
				<div class="toolbarbutton-icon"></div>
				<toolbar-button-label class="toolbarbutton-text"></toolbar-button-label>
			</fragment>
		);
	}

	public constructor(widget?: CustomizableUIWidgetProps<ToolbarButtonWidget>) {
		super({
			visible: true,
			display: CustomizableUIWidgetDisplay.Icons,
			configurableProps: widget.configurableProps
		});

		applyConfig(this, widget);
	}
}

customElements.define("widget-toolbar-button", ToolbarButtonWidget);

export default ToolbarButtonWidget;
