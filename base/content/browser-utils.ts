/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** @global */
function html(
	tagName: string,
	attributes?: { [key: string]: any },
	...children: Array<HTMLElement | string>
) {
	attributes = attributes || {};
	children = children || [];

	const element =
		tagName == "fragment" ? document.createDocumentFragment() : document.createElement(tagName);

	if (tagName !== "fragment") {
		for (const [key, value] of Object.entries(attributes)) {
			(element as HTMLElement).setAttribute(key, value);
		}
	}

	for (const child of children) {
		if (child instanceof HTMLElement) element.appendChild(child);
		else if (typeof child === "string") {
			const text = document.createTextNode(child);

			element.appendChild(text);
		}
	}

	return element;
}

/** @global */
function shim(name: string, props?: any) {
	return new Proxy(
		{},
		{
			get(target, property) {
				console.debug(`${name}: Tried accessing getter '${property.toString()}'.`);

				return props && props[property.toString()]
					? props[property.toString()]()
					: function () {
							console.debug(
								`${name}: Tried calling getter '${property.toString()}'.`
							);

							return null;
					  };
			},
			set(target, property, newValue) {
				console.debug(
					`${name}: Tried updating setter '${property.toString()}' to '${newValue.toString()}'.`
				);
				return true;
			}
		}
	);
}

/** @global */
function shimFunction(name: string, returnValue?: () => any) {
	return (...args: any) => {
		console.debug(`${name}: Tried calling '${name}'.`);

		return returnValue ? returnValue() : undefined;
	};
}

/** @global */
function generateID(rounds: number = 4) {
	return [...Array(rounds)]
		.map((i) => Math.round(Date.now() + Math.random() * Date.now()).toString(36))
		.join("");
}
