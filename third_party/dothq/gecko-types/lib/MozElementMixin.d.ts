/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface MozElementMixinStatic {
	/*
	 * A declarative way to wire up attribute inheritance and automatically generate
	 * the `observedAttributes` getter.  For example, if you returned:
	 *    {
	 *      ".foo": "bar,baz=bat"
	 *    }
	 *
	 * Then the base class will automatically return ["bar", "bat"] from `observedAttributes`,
	 * and set up an `attributeChangedCallback` to pass those attributes down onto an element
	 * matching the ".foo" selector.
	 *
	 * See the `inheritAttribute` function for more details on the attribute string format.
	 *
	 * @return {Object<string selector, string attributes>}
	 */
	inheritedAttributes(): { [key: string]: string };

	flippedInheritedAttributes();
	/*
	 * Generate this array based on `inheritedAttributes`, if any. A class is free to override
	 * this if it needs to do something more complex or wants to opt out of this behavior.
	 */
	get observedAttributes(): string[];

	/**
	 * Used by custom elements for caching fragments. We now would be
	 * caching once per class while also supporting subclasses.
	 *
	 * If available, returns the cached fragment.
	 * Otherwise, creates it.
	 *
	 * Example:
	 *
	 *  class ElementA extends MozXULElement {
	 *    static get markup() {
	 *      return `<hbox class="example"`;
	 *    }
	 *
	 *    connectedCallback() {
	 *      this.appendChild(this.constructor.fragment);
	 *    }
	 *  }
	 *
	 * @return {importedNode} The imported node that has not been
	 * inserted into document tree.
	 */
	get fragment(): Node;

	/**
	 * Allows eager deterministic construction of XUL elements with XBL attached, by
	 * parsing an element tree and returning a DOM fragment to be inserted in the
	 * document before any of the inner elements is referenced by JavaScript.
	 *
	 * This process is required instead of calling the createElement method directly
	 * because bindings get attached when:
	 *
	 * 1. the node gets a layout frame constructed, or
	 * 2. the node gets its JavaScript reflector created, if it's in the document,
	 *
	 * whichever happens first. The createElement method would return a JavaScript
	 * reflector, but the element wouldn't be in the document, so the node wouldn't
	 * get XBL attached. After that point, even if the node is inserted into a
	 * document, it won't get XBL attached until either the frame is constructed or
	 * the reflector is garbage collected and the element is touched again.
	 *
	 * @param {string} str
	 *        String with the XML representation of XUL elements.
	 * @param {string[]} [entities]
	 *        An array of DTD URLs containing entity definitions.
	 *
	 * @return {DocumentFragment} `DocumentFragment` instance containing
	 *         the corresponding element tree, including element nodes
	 *         but excluding any text node.
	 */
	parseXULToFragment(
		str: string,
		entities: string[]
	): DocumentFragment;

	/**
	 * Insert a localization link to an FTL file. This is used so that
	 * a Custom Element can wait to inject the link until it's connected,
	 * and so that consuming documents don't require the correct <link>
	 * present in the markup.
	 *
	 * @param path
	 *        The path to the FTL file
	 */
	insertFTLIfNeeded(path: string): void;

	/**
	 * Indicate that a class defining a XUL element implements one or more
	 * XPCOM interfaces by adding a getCustomInterface implementation to it,
	 * as well as an implementation of QueryInterface.
	 *
	 * The supplied class should implement the properties and methods of
	 * all of the interfaces that are specified.
	 *
	 * @param cls
	 *        The class that implements the interface.
	 * @param names
	 *        Array of interface names.
	 */
	implementCustomInterface(cls: any, ifaces: string[]): void;
}

export interface MozElementMixin {
	/**
	 * After setting content, calling this will cache the elements from selectors in the
	 * static `inheritedAttributes` Object. It'll also do an initial call to `this.inheritAttributes()`,
	 * so in the simple case, this is the only function you need to call.
	 *
	 * This should be called any time the children that are inheriting attributes changes. For instance,
	 * it's common in a connectedCallback to do something like:
	 *
	 *   this.textContent = "";
	 *   this.append(MozXULElement.parseXULToFragment(`<label />`))
	 *   this.initializeAttributeInheritance();
	 *
	 */
	initializeAttributeInheritance(): void;

	/**
	 * Implements attribute value inheritance by child elements.
	 *
	 * @param {array} list
	 *        An array of (to-element-selector, to-attr) pairs.
	 * @param {string} attr
	 *        An attribute to propagate.
	 */
	inheritAttribute(list: any[], attr: string);

	/**
	 * Used in setting up attribute inheritance. Takes a selector and returns
	 * an element for that selector from shadow DOM if there is a shadowRoot,
	 * or from the light DOM if not.
	 *
	 * Here's one problem this solves. ElementB extends ElementA which extends
	 * MozXULElement. ElementA has a shadowRoot. ElementB tries to inherit
	 * attributes in light DOM by calling `initializeAttributeInheritance`
	 * but that fails because it defaults to inheriting from the shadow DOM
	 * and not the light DOM. (See bug 1545824.)
	 *
	 * To solve this, ElementB can override `getElementForAttrInheritance` so
	 * it queries the light DOM for some selectors as needed. For example:
	 *
     * @example
	 * class ElementA extends MozXULElement {
	 *   static get inheritedAttributes() {
	 *     return { ".one": "attr" };
	 *   }
	 * }
	 *
     * class ElementB extends customElements.get("elementa") {
     *   static get inheritedAttributes() {
     *     return Object.assign({}, super.inheritedAttributes(), {
     *       ".two": "attr",
     *     });
     *   }
     *   getElementForAttrInheritance(selector) {
     *     if (selector == ".two") {
     *       return this.querySelector(selector)
     *     } else {
     *         return super.getElementForAttrInheritance(selector);
     *     }
     *   }
     * }
     * 
	 * @param {string} selector
	 *        A selector used to query an element.
	 *
	 * @return {Element} The element found by the selector.
	 */
	getElementForAttrInheritance(selector: string): Element;

	/**
	 * Sometimes an element may not want to run connectedCallback logic during
	 * parse. This could be because we don't want to initialize the element before
	 * the element's contents have been fully parsed, or for performance reasons.
	 * If you'd like to opt-in to this, then add this to the beginning of your
	 * `connectedCallback` and `disconnectedCallback`:
	 *
	 *    ```js
     *    if (this.delayConnectedCallback()) { return }
     *    ```
	 *
	 * And this at the beginning of your `attributeChangedCallback`
	 *
	 *    ```js
     *    if (!this.isConnectedAndReady) { return; }
     *    ```
	 */
	delayConnectedCallback(): boolean;

	get isConnectedAndReady(): boolean;

	/**
	 * Passes DOM events to the on_<event type> methods.
	 */
	handleEvent(event: Event): void;
}
