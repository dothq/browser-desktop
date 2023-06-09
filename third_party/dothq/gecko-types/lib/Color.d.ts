/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

interface ColorInstance {
	/**
	 * Formula from W3C's WCAG 2.0 spec's relative luminance, section 1.4.1,
	 * http://www.w3.org/TR/WCAG20/.
	 *
	 * @return {Number} Relative luminance, represented as number between 0 and 1.
	 */
	relativeLuminance: number;

	/**
	 * @return {Boolean} TRUE if you need to use a bright color (e.g. 'white'), when
	 *                   this color is set as the background.
	 */
	useBrightText: boolean;

	/**
	 * Get the contrast ratio between the current color and a second other color.
	 * A common use case is to express the difference between a foreground and a
	 * background color in numbers.
	 * Formula from W3C's WCAG 2.0 spec's contrast ratio, section 1.4.1,
	 * http://www.w3.org/TR/WCAG20/.
	 *
	 * @param  {Color}  otherColor Color instance to calculate the contrast with
	 * @return {Number} Contrast ratios can range from 1 to 21, commonly written
	 *                  as 1:1 to 21:1.
	 */
	contrastRatio(otherColor: ColorInstance): number;

	/**
	 * Method to check if the contrast ratio between two colors is high enough to
	 * be discernable.
	 *
	 * @param  {Color}  otherColor Color instance to calculate the contrast with
	 * @param  {String} [level]    WCAG conformance level that maps to the minimum
	 *                             required contrast ratio. Defaults to 'AA'
	 * @return {Boolean}
	 */
	isContrastRatioAcceptable(
		otherColor: ColorInstance,
		level?: string
	): boolean;
}

export interface Color {
	new (r: number, g: number, b: number): ColorInstance;
	new (...rest: number[]): ColorInstance;
}
