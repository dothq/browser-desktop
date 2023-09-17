/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const DotShortcutUtils = {
	/**
	 * The Shift key
	 */
	KEY_SHIFT: 0x00000001,

	/**
	 * The Alt key
	 *
	 * Windows/*nix: Alt
	 * macOS: Option
	 */
	KEY_ALT: 0x00000002,

	/**
	 * The Control key
	 *
	 * Windows/*nix: Ctrl
	 * macOS: Control
	 */
	KEY_CONTROL: 0x00000004,

	/**
	 * The Meta key
	 *
	 * Windows: Win
	 * macOS: Cmd
	 * *nix: Super
	 */
	KEY_META: 0x00000008
};
