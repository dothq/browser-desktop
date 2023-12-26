/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class DevelopmentPreferencesPopout extends MozHTMLElement {
	get elements() {
		return {
			handles: /** @type {HTMLDivElement} */ (
				this.querySelector(".dev-preference-handles") ||
					html("div", {
						class: "dev-preference-handles",
						slot: "handles"
					})
			),
			closeButton: /** @type {HTMLButtonElement} */ (
				this.shadowRoot.querySelector("button.close-button") ||
					html(
						"button",
						{ class: "close-button", slot: "end" },
						"Close"
					)
			),
			resetButton: /** @type {HTMLButtonElement} */ (
				this.shadowRoot.querySelector("button.reset-button") ||
					html(
						"button",
						{ class: "reset-button", slot: "end" },
						"Reset to defaults"
					)
			)
		};
	}

	handles = new Map();

	setHandleValue(prefId, value) {
		const handle = this.handles.get(prefId);
		if (!handle) return null;

		if (handle.inputType == "checkbox") {
			handle.inputEl.checked = value === true;
		} else {
			handle.inputEl.value = value;
		}
	}

	getInputTypeForType(type, value) {
		switch (type) {
			case "string":
				if (Array.isArray(value)) return "select";
				return "text";
			case "boolean":
				return "checkbox";
			default:
				return type;
		}
	}

	getPrefAttributes(prefId, defaultValue = null) {
		let attributes = {
			value: null,
			type: null,
			inputType: this.handles.get(prefId)?.inputType,
			locked: Services.prefs.prefIsLocked(prefId)
		};

		const { PREF_BOOL, PREF_INT, PREF_STRING } = Ci.nsIPrefBranch;

		const prefTypeInt = Services.prefs.getPrefType(prefId);

		switch (prefTypeInt) {
			case PREF_BOOL:
				attributes.type = "boolean";
				attributes.value = Services.prefs.getBoolPref(prefId);
				break;
			case PREF_INT:
				attributes.type = "number";
				attributes.value = Services.prefs.getIntPref(prefId);
				break;
		}

		if (!attributes.type) {
			if (defaultValue !== null) {
				attributes.type = Array.isArray(defaultValue)
					? "string"
					: typeof defaultValue;
				attributes.value = defaultValue;
			} else {
				try {
					attributes.type = "string";
					attributes.value = Services.prefs.getStringPref(prefId);
				} catch (e) {}
			}
		}

		attributes.inputType = this.getInputTypeForType(
			attributes.type,
			attributes.value
		);

		return attributes;
	}

	getPrefValue(prefId) {
		const value = this.getPrefAttributes(prefId).value;
		return value;
	}

	registerHandle(prefId, defaultValue = null) {
		if (this.handles.get(prefId)) {
			console.warn(
				`${this.constructor.name}: Handle with preference '${prefId}' already registered.`
			);
			return;
		}

		const prefAttributes = this.getPrefAttributes(prefId, defaultValue);

		const handleEl = html("div", { class: "dev-preference-handle" });

		const handleInputId = `preference-handle-input--${prefId}`;

		if (prefAttributes.inputType !== "checkbox") {
			handleEl.appendChild(html("label", { for: handleInputId }, prefId));
		}

		const handleInputAttrs = {
			id: handleInputId,
			type: prefAttributes.inputType,
			indeterminate:
				prefAttributes.inputType == "checkbox" &&
				typeof prefAttributes.value == "undefined"
		};

		if (prefAttributes.locked) {
			handleInputAttrs.readonly = "";
		}

		const handleInputEl = /** @type {HTMLInputElement} */ (
			html(
				prefAttributes.inputType == "select" ? "select" : "input",
				handleInputAttrs
			)
		);

		if (prefAttributes.inputType == "select") {
			for (const opt of prefAttributes.value) {
				handleInputEl.appendChild(html("option", { value: opt }, opt));
			}
		}

		handleInputEl.addEventListener("change", (e) => {
			switch (prefAttributes.type) {
				case "string":
					Services.prefs.setStringPref(prefId, handleInputEl.value);
					this.setHandleValue(prefId, handleInputEl.value);
					break;
				case "boolean":
					Services.prefs.setBoolPref(prefId, handleInputEl.checked);
					this.setHandleValue(prefId, handleInputEl.checked);
					break;
				case "number":
					Services.prefs.setIntPref(
						prefId,
						handleInputEl.valueAsNumber
					);
					this.setHandleValue(prefId, handleInputEl.valueAsNumber);
					break;
			}
		});

		this.handles.set(prefId, {
			type: prefAttributes.type,
			inputType: prefAttributes.inputType,
			inputEl: handleInputEl,
			defaultValue
		});

		this.setHandleValue(prefId, this.getPrefValue(prefId));

		handleEl.appendChild(handleInputEl);

		if (prefAttributes.inputType == "checkbox") {
			handleEl.appendChild(html("label", { for: handleInputId }, prefId));
		}

		this.elements.handles.appendChild(handleEl);
	}

	observePreferences(subject, topic, data) {
		if (this.handles.get(data)) {
			this.setHandleValue(data, this.getPrefValue(data));
		}
	}

	insertStylesheet() {
		this.insertedSheet = document.createProcessingInstruction(
			"xml-stylesheet",
			`href="chrome://dot/content/widgets/dev-preferences-popout.css" type="text/css"`
		);

		document.insertBefore(this.insertedSheet, document.documentElement);
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;
		this.insertStylesheet();

		this.attachShadow({ mode: "open" });

		this.appendChild(
			html("strong", { slot: "start" }, "Preference Handles")
		);

		this.shadowRoot.appendChild(html("slot", { name: "start" }));
		this.shadowRoot.appendChild(html("slot", { name: "handles" }));

		this.appendChild(this.elements.handles);

		this.shadowRoot.appendChild(
			html(
				"div",
				{ class: "dev-preferences-buttons", part: "end" },
				this.elements.resetButton,
				this.elements.closeButton
			)
		);

		this.elements.closeButton.addEventListener("click", () => {
			this.remove();
		});

		this.elements.resetButton.addEventListener("click", () => {
			for (const [prefId, handle] of this.handles) {
				switch (handle.type) {
					case "boolean":
						Services.prefs.setBoolPref(prefId, handle.defaultValue);
						break;
					case "number":
						Services.prefs.setIntPref(prefId, handle.defaultValue);
						break;
					case "string":
						Services.prefs.setStringPref(
							prefId,
							handle.defaultValue
						);
						break;
				}
			}
		});

		const LOG_LEVELS = [
			"all",
			"debug",
			"log",
			"info",
			"clear",
			"trace",
			"timeEnd",
			"time",
			"assert",
			"group",
			"groupEnd",
			"profile",
			"profileEnd",
			"dir",
			"dirxml",
			"warn",
			"error",
			"off"
		];

		// Preference handles:
		this.registerHandle("dot.window.use-native-titlebar", false);
		this.registerHandle("dot.tabs.debug_information.visible", false);
		this.registerHandle("dot.customizable.debug_context.enabled", false);
		this.registerHandle("dot.commands.loglevel", LOG_LEVELS);
		this.registerHandle("dot.panels.debug_information.visible", false);
		this.registerHandle("dot.tabs.in_animation_duration_ms", 50);
		this.registerHandle("dot.tabs.out_animation_duration_ms", 30);
		this.registerHandle("dot.customizable.loglevel", LOG_LEVELS);
		this.registerHandle("dot.tab_progress.loglevel", LOG_LEVELS);
		this.registerHandle(
			"dot.customizable.debug_information.enabled",
			false
		);

		Services.prefs.addObserver("", this.observePreferences.bind(this));
	}

	disconnectedCallback() {
		if (this.insertedSheet) {
			this.insertedSheet.remove();
		}
	}
}

customElements.define("dev-preferences-popout", DevelopmentPreferencesPopout);
