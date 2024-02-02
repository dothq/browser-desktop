/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { ThemeIcons } = ChromeUtils.importESModule(
	"resource://gre/modules/ThemeIcons.sys.mjs"
);

/**
 * Creates a MozMenuItem element
 *
 * @template {Constructor<Element>} T - The base class constructor.
 * @param {T} Base - The base class to extend.
 */
var MozMenuItemBaseMixin = (Base) => {
	class MozMenuItemBase extends MozElements.BaseTextMixin(
		BrowserCommandElementMixin(Base)
	) {
		constructor() {
			super();

			this.attachShadow({ mode: "open" });
		}

		static get observedAttributes() {
			return ["label", "image", "acceltext", "grouped"];
		}

		/**
		 * Creates a new menu item image
		 * @param {string} slot
		 * @param {string} [defaultImage]
		 */
		#createMenuItemImage(slot, defaultImage) {
			const image = document.createXULElement("image");

			image.classList.add("browser-menuitem-image");
			image.slot = slot;

			if (defaultImage) {
				/** @type {HTMLImageElement} */ (image).src = defaultImage;
			}

			return image;
		}

		/**
		 * The nearest menu area host
		 */
		get host() {
			return /** @type {BrowserCustomizableArea} */ (
				this.closest("menupopup")
			);
		}

		/**
		 * The anatomy of a menu item
		 */
		get elements() {
			return {
				label: /** @type {HTMLSpanElement} */ (
					this.querySelector(".browser-menuitem-label") ||
						html(
							"span",
							{
								class: "browser-menuitem-label",
								slot: "label"
							},
							this.getAttribute("label") || ""
						)
				),
				imageLeft: /** @type {HTMLImageElement} */ (
					this.querySelector("[slot=image-left]") ||
						this.#createMenuItemImage(
							"image-left",
							this.getAttribute("image") || ""
						)
				),
				accelerator: /** @type {HTMLSpanElement} */ (
					this.querySelector(".browser-menuitem-accelerator") ||
						html("span", {
							class: "browser-menuitem-accelerator",
							slot: "label"
						})
				),
				imageRight: /** @type {HTMLImageElement} */ (
					this.querySelector("[slot=image-right]") ||
						this.#createMenuItemImage("image-right")
				)
			};
		}

		/**
		 * Handles incoming mutations to the attached command
		 *
		 * @param {string} audience
		 * @param {any} attributeName
		 * @param {any} value
		 */
		_observeCommandMutation(audience, attributeName, value) {
			switch (attributeName) {
				case "labelAuxiliary":
				case "label":
				case "disabled":
				case "inert":
				case "checked":
					this[attributeName] = value;
					break;
				case "icon":
					this.image = ThemeIcons.getURI(value);
					break;
				default:
					this.setAttribute(attributeName, value);
					break;
			}
		}

		// nsIDOMXULSelectControlItemElement
		set value(val) {
			this.setAttribute("value", val);
		}

		get value() {
			return this.getAttribute("value");
		}

		// nsIDOMXULSelectControlItemElement
		get selected() {
			return this.getAttribute("selected") == "true";
		}

		// nsIDOMXULSelectControlItemElement
		get control() {
			var parent = this.parentNode;
			// Return the parent if it is a menu or menulist.
			if (
				parent &&
				XULMenuElement.isInstance(
					/** @type {any} */ (parent).parentNode
				)
			) {
				return parent.parentNode;
			}
			return null;
		}

		// nsIDOMXULContainerItemElement
		get parentContainer() {
			for (
				var parent = this.parentNode;
				parent;
				parent = parent.parentNode
			) {
				if (XULMenuElement.isInstance(/** @type {any} */ (parent))) {
					return parent;
				}
			}
			return null;
		}

		/**
		 * The type of this menu item
		 */
		get type() {
			return this.getAttribute("type");
		}

		/**
		 * The label of this menu item
		 */
		get label() {
			return this.getAttribute("label");
		}

		set label(newValue) {
			if (this.label == newValue) return;

			this.elements.label.textContent = newValue;
			this.setAttribute("label", newValue);
		}

		/**
		 * The auxiliary label of this menu item
		 */
		get labelAuxiliary() {
			return this.getAttribute("labelauxiliary");
		}

		set labelAuxiliary(newValue) {
			if (this.labelAuxiliary == newValue) return;

			this.setAttribute("labelauxiliary", newValue);
		}

		/**
		 * The image of this menu item
		 */
		get image() {
			return this.getAttribute("image");
		}

		set image(newValue) {
			if (this.image == newValue) return;

			this.elements.imageLeft.src = newValue;
			this.setAttribute("image", newValue);
		}

		/**
		 * Determines whether the menu item is disabled or not
		 */
		get disabled() {
			return this.getAttribute("disabled");
		}

		set disabled(newValue) {
			this.setAttribute("disabled", newValue);
			this.toggleAttribute("disabled", !!newValue);
		}

		/**
		 * Determines whether the menu item is checked or not
		 */
		get checked() {
			return this.getAttribute("checked");
		}

		set checked(newValue) {
			this.setAttribute("checked", newValue);
			this.toggleAttribute("checked", !!newValue);
		}

		/**
		 * The accelerator text of this menu item
		 */
		get acceltext() {
			return this.getAttribute("acceltext");
		}

		set acceltext(newValue) {
			this.setAttribute("acceltext", newValue);

			this.elements.accelerator.textContent = newValue;
		}

		connectedCallback() {
			super.connectedCallback();

			const style = document.createElement("link");
			style.rel = "stylesheet";
			style.href = "chrome://dot/content/widgets/xul-menuitem.css";
			this.shadowRoot.appendChild(style);

			this.shadowRoot.append(
				html(
					"div",
					{ class: "browser-menuitem-container" },
					html("slot", { name: "image-left" }),
					html(
						"div",
						{ class: "browser-menuitem-labels" },
						html("slot", { name: "label" })
					),
					html("slot", { name: "image-right" })
				),
				html("slot")
			);

			this.append(
				this.elements.imageLeft,
				this.elements.label,
				this.elements.accelerator
			);

			if (
				this.tagName == "menu" ||
				this.type == "checkbox" ||
				this.type == "radio"
			) {
				this.append(this.elements.imageRight);
			}
		}

		attributeChangedCallback(attribute, oldValue, newValue) {
			if (newValue == oldValue) return;

			switch (attribute) {
				case "label":
				case "image":
				case "acceltext":
					this[attribute] = newValue;
					break;
			}
		}

		disconnectedCallback() {
			super.disconnectedCallback();
		}
	}

	MozXULElement.implementCustomInterface(MozMenuItemBase, [
		Ci.nsIDOMXULSelectControlItemElement,
		Ci.nsIDOMXULContainerItemElement
	]);

	return MozMenuItemBase;
};

/**
 * Creates a MozMenu element
 *
 * @template {Constructor<Element>} T - The base class constructor.
 * @param {T} Base - The base class to extend.
 */
var MozMenuBaseMixin = (Base) => {
	class MozMenuBase extends MozMenuItemBaseMixin(Base) {
		set open(val) {
			/** @type {any} */ (this).openMenu(val);
		}

		get open() {
			return this.hasAttribute("open");
		}

		get itemCount() {
			var menupopup = this.menupopup;
			return menupopup ? menupopup.children.length : 0;
		}

		get menupopup() {
			const XUL_NS =
				"http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

			for (
				var child = this.firstElementChild;
				child;
				child = child.nextElementSibling
			) {
				if (
					child.namespaceURI == XUL_NS &&
					child.localName == "menupopup"
				) {
					return child;
				}
			}
			return null;
		}

		appendItem(aLabel, aValue) {
			var menupopup = this.menupopup;
			if (!menupopup) {
				menupopup = this.ownerDocument.createXULElement("menupopup");
				this.appendChild(menupopup);
			}

			var menuitem = this.ownerDocument.createXULElement("menuitem");
			menuitem.setAttribute("label", aLabel);
			menuitem.setAttribute("value", aValue);

			return menupopup.appendChild(menuitem);
		}

		getIndexOfItem(aItem) {
			var menupopup = this.menupopup;
			if (menupopup) {
				var items = menupopup.children;
				var length = items.length;
				for (var index = 0; index < length; ++index) {
					if (items[index] == aItem) {
						return index;
					}
				}
			}
			return -1;
		}

		getItemAtIndex(aIndex) {
			var menupopup = this.menupopup;
			if (
				!menupopup ||
				aIndex < 0 ||
				aIndex >= menupopup.children.length
			) {
				return null;
			}

			return menupopup.children[aIndex];
		}

		constructor() {
			super();
		}
	}

	MozXULElement.implementCustomInterface(MozMenuBase, [
		Ci.nsIDOMXULContainerElement
	]);

	return MozMenuBase;
};
