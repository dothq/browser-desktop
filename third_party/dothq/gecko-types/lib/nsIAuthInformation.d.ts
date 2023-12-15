/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface nsIAuthInformation {
	/**
	 * This dialog belongs to a network host.
	 */
	AUTH_HOST: 1;

	/**
	 * This dialog belongs to a proxy.
	 */
	AUTH_PROXY: 2;

	/**
	 * This dialog needs domain information. The user interface should show a
	 * domain field, prefilled with the domain attribute's value.
	 */
	NEED_DOMAIN: 4;

	/**
	 * This dialog only asks for password information. Authentication prompts
	 * SHOULD NOT show a username field. Attempts to change the username field
	 * will have no effect. nsIAuthPrompt2 implementations should, however, show
	 * its initial value to the user in some form. For example, a paragraph in
	 * the dialog might say "Please enter your password for user jsmith at
	 * server intranet".
	 *
	 * This flag is mutually exclusive with #NEED_DOMAIN.
	 */
	ONLY_PASSWORD: 8;

	/**
	 * We have already tried to log in for this channel
	 * (with auth values from a previous promptAuth call),
	 * but it failed, so we now ask the user to provide a new, correct login.
	 *
	 * @see also RFC 2616, Section 10.4.2
	 */
	PREVIOUS_FAILED: 16;

	/**
	 * A cross-origin sub-resource requests an authentication.
	 * The message presented to users must reflect that.
	 */
	CROSS_ORIGIN_SUB_RESOURCE: 32;
	/* @} */

	/**
	 * Flags describing this dialog. A bitwise OR of the flag values
	 * above.
	 *
	 * It is possible that neither #AUTH_HOST nor #AUTH_PROXY are set.
	 *
	 * Auth prompts should ignore flags they don't understand; especially, they
	 * should not throw an exception because of an unsupported flag.
	 */
	readonly flags: number;

	/**
	 * The server-supplied realm of the authentication as defined in RFC 2617.
	 * Can be the empty string if the protocol does not support realms.
	 * Otherwise, this is a human-readable string like "Secret files".
	 */
	readonly realm: string;

	/**
	 * The authentication scheme used for this request, if applicable. If the
	 * protocol for this authentication does not support schemes, this will be
	 * the empty string. Otherwise, this will be a string such as "basic" or
	 * "digest". This string will always be in lowercase.
	 */
	readonly authenticationScheme: string;

	/**
	 * The initial value should be used to prefill the dialog or be shown
	 * in some other way to the user.
	 * On return, this parameter should contain the username entered by
	 * the user.
	 * This field can only be changed if the #ONLY_PASSWORD flag is not set.
	 */
	username: string;

	/**
	 * The initial value should be used to prefill the dialog or be shown
	 * in some other way to the user.
	 * The password should not be shown in clear.
	 * On return, this parameter should contain the password entered by
	 * the user.
	 */
	password: string;

	/**
	 * The initial value should be used to prefill the dialog or be shown
	 * in some other way to the user.
	 * On return, this parameter should contain the domain entered by
	 * the user.
	 * This attribute is only used if flags include #NEED_DOMAIN.
	 */
	domain: string;
}
