/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowsingContext } from "../BrowsingContext";
import { nsIAuthInformation } from "../nsIAuthInformation";

export interface ServicesPrompt {
	/**
	 * Puts up an alert dialog with an OK button.
	 *
	 * @param aParent
	 *        The parent window or null.
	 * @param aDialogTitle
	 *        Text to appear in the title of the dialog.
	 * @param aText
	 *        Text to appear in the body of the dialog.
	 */
	alert(parent: Window, dialogTitle: string, text: string): void;
	/**
	 * Like alert, but with a BrowsingContext as parent.
	 *
	 * @param aBrowsingContext
	 *        The browsing context the prompt should be opened for.
	 * @param modalType
	 *        Whether the prompt should be window, tab or content modal.
	 */
	alertBC(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string
	): void;
	/**
	 * Async version of alertBC
	 *
	 * @return A promise which resolves when the prompt is dismissed.
	 */
	asyncAlert(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string
	): Promise<any>;

	/**
	 * Puts up an alert dialog with an OK button and a labeled checkbox.
	 *
	 * @param aParent
	 *        The parent window or null.
	 * @param aDialogTitle
	 *        Text to appear in the title of the dialog.
	 * @param aText
	 *        Text to appear in the body of the dialog.
	 * @param aCheckMsg
	 *        Text to appear with the checkbox.
	 * @param aCheckState
	 *        Contains the initial checked state of the checkbox when this method
	 *        is called and the final checked state after this method returns.
	 */
	alertCheck(
		parent: Window,
		dialogTitle: string,
		text: string,
		checkMsg: string,
		checkState: boolean
	): void;
	/**
	 * Like alertCheck, but with a BrowsingContext as parent.
	 *
	 * @param aBrowsingContext
	 *        The browsing context the prompt should be opened for.
	 * @param modalType
	 *        Whether the prompt should be window, tab or content modal.
	 */
	alertCheckBC(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		checkMsg: string,
		checkState: boolean
	): void;
	/**
	 * Async version of alertCheckBC
	 *
	 * @return A promise which resolves when the prompt is dismissed.
	 *
	 * @resolves nsIPropertyBag { checked: boolean }
	 */
	asyncAlertCheck(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		checkMsg: string,
		checkState: boolean
	): Promise<any>;

	/**
	 * Puts up a dialog with OK and Cancel buttons.
	 *
	 * @param aParent
	 *        The parent window or null.
	 * @param aDialogTitle
	 *        Text to appear in the title of the dialog.
	 * @param aText
	 *        Text to appear in the body of the dialog.
	 *
	 * @return true for OK, false for Cancel
	 */
	confirm(
		parent: Window,
		dialogTitle: string,
		text: string
	): boolean;
	/**
	 * Like confirm, but with a BrowsingContext as parent.
	 *
	 * @param aBrowsingContext
	 *        The browsing context the prompt should be opened for.
	 * @param modalType
	 *        Whether the prompt should be window, tab or content modal.
	 */
	confirmBC(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string
	): boolean;
	/**
	 * Async version of confirmBC
	 *
	 * @return A promise which resolves when the prompt is dismissed.
	 *
	 * @resolves nsIPropertyBag { ok: boolean }
	 */
	asyncConfirm(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string
	): Promise<any>;

	/**
	 * Puts up a dialog with OK and Cancel buttons and a labeled checkbox.
	 *
	 * @param aParent
	 *        The parent window or null.
	 * @param aDialogTitle
	 *        Text to appear in the title of the dialog.
	 * @param aText
	 *        Text to appear in the body of the dialog.
	 * @param aCheckMsg
	 *        Text to appear with the checkbox.
	 * @param aCheckState
	 *        Contains the initial checked state of the checkbox when this method
	 *        is called and the final checked state after this method returns.
	 *
	 * @return true for OK, false for Cancel
	 */
	confirmCheck(
		parent: Window,
		dialogTitle: string,
		text: string,
		checkMsg: string,
		checkState: boolean
	): boolean;
	/**
	 * Like confirmCheck, but with a BrowsingContext as parent.
	 *
	 * @param aBrowsingContext
	 *        The browsing context the prompt should be opened for.
	 * @param modalType
	 *        Whether the prompt should be window, tab or content modal.
	 */
	confirmCheckBC(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		checkMsg: string,
		checkState: boolean
	): boolean;
	/**
	 * Async version of confirmCheckBC
	 *
	 * @return A promise which resolves when the prompt is dismissed.
	 *
	 * @resolves nsIPropertyBag { ok: boolean, checked: boolean }
	 */
	asyncConfirmCheck(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		checkMsg: string,
		checkState: boolean
	): Promise<any>;

	/**
	 * Button Flags
	 *
	 * The following flags are combined to form the aButtonFlags parameter passed
	 * to confirmEx.  See confirmEx for more information on how the flags may be
	 * combined.
	 */

	/**
	 * Button Position Flags
	 */
	BUTTON_POS_0: 1;
	BUTTON_POS_1: 256;
	BUTTON_POS_2: 65536;

	/**
	 * Button Title Flags (used to set the labels of buttons in the prompt)
	 */
	BUTTON_TITLE_OK: 1;
	BUTTON_TITLE_CANCEL: 2;
	BUTTON_TITLE_YES: 3;
	BUTTON_TITLE_NO: 4;
	BUTTON_TITLE_SAVE: 5;
	BUTTON_TITLE_DONT_SAVE: 6;
	BUTTON_TITLE_REVERT: 7;
	BUTTON_TITLE_IS_STRING: 127;

	/**
	 * Button Default Flags (used to select which button is the default one)
	 */
	BUTTON_POS_0_DEFAULT: 0;
	BUTTON_POS_1_DEFAULT: 16777216;
	BUTTON_POS_2_DEFAULT: 33554432;

	/**
	 * Causes the buttons to be initially disabled.  They are enabled after a
	 * timeout expires.  The implementation may interpret this loosely as the
	 * intent is to ensure that the user does not click through a security dialog
	 * too quickly.  Strictly speaking, the implementation could choose to ignore
	 * this flag.
	 */
	BUTTON_DELAY_ENABLE: 67108864;

	/**
	 * Causes a spinner to be displayed in the dialog box.
	 */
	SHOW_SPINNER: 134217728134217728;

	/**
	 * Selects the standard set of OK/Cancel buttons.
	 */
	STD_OK_CANCEL_BUTTONS: number;

	/**
	 * Selects the standard set of Yes/No buttons.
	 */
	STD_YES_NO_BUTTONS: number;

	// Indicates whether a prompt should be shown in-content, on tab level or as a separate window
	MODAL_TYPE_CONTENT: 1;
	MODAL_TYPE_TAB: 2;
	MODAL_TYPE_WINDOW: 3;
	// Like MODAL_TYPE_WINDOW, but shown inside a parent window (with similar
	// styles as _TAB and _CONTENT types) rather than as a new window:
	MODAL_TYPE_INTERNAL_WINDOW: 4;

	/**
	 * Puts up a dialog with up to 3 buttons and an optional, labeled checkbox.
	 *
	 * @param aParent
	 *        The parent window or null.
	 * @param aDialogTitle
	 *        Text to appear in the title of the dialog.
	 * @param aText
	 *        Text to appear in the body of the dialog.
	 * @param aButtonFlags
	 *        A combination of Button Flags.
	 * @param aButton0Title
	 *        Used when button 0 uses TITLE_IS_STRING
	 * @param aButton1Title
	 *        Used when button 1 uses TITLE_IS_STRING
	 * @param aButton2Title
	 *        Used when button 2 uses TITLE_IS_STRING
	 * @param aCheckMsg
	 *        Text to appear with the checkbox.  Null if no checkbox.
	 * @param aCheckState
	 *        Contains the initial checked state of the checkbox when this method
	 *        is called and the final checked state after this method returns.
	 *
	 * @return index of the button pressed.
	 *
	 * Buttons are numbered 0 - 2. The implementation can decide whether the
	 * sequence goes from right to left or left to right.  Button 0 is the
	 * default button unless one of the Button Default Flags is specified.
	 *
	 * A button may use a predefined title, specified by one of the Button Title
	 * Flags values.  Each title value can be multiplied by a position value to
	 * assign the title to a particular button.  If BUTTON_TITLE_IS_STRING is
	 * used for a button, the string parameter for that button will be used.  If
	 * the value for a button position is zero, the button will not be shown.
	 *
	 * In general, aButtonFlags is constructed per the following example:
	 *
	 *   aButtonFlags: (BUTTON_POS_0) * (BUTTON_TITLE_AAA) +
	 *                  (BUTTON_POS_1) * (BUTTON_TITLE_BBB) +
	 *                   BUTTON_POS_1_DEFAULT;
	 *
	 * where "AAA" and "BBB" correspond to one of the button titles.
	 */
	confirmEx(
		parent: Window,
		dialogTitle: string,
		text: string,
		buttonFlags: number,
		button0Title: string,
		button1Title: string,
		button2Title: string,
		checkMsg: string,
		checkState: boolean
	): number;
	/**
	 * Like confirmEx, but with a BrowsingContext as parent.
	 *
	 * @param aBrowsingContext
	 *        The browsing context the prompt should be opened for.
	 * @param modalType
	 *        Whether the prompt should be window, tab or content modal.
	 */
	confirmExBC(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		buttonFlags: number,
		button0Title: string,
		button1Title: string,
		button2Title: string,
		checkMsg: string,
		checkState: boolean
	): number;
	/**
	 * Async version of confirmExBC
	 *
	 * @return A promise which resolves when the prompt is dismissed.
	 *
	 * @resolves nsIPropertyBag { checked: boolean, buttonNumClicked: int }
	 */
	asyncConfirmEx(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		buttonFlags: number,
		button0Title: string,
		button1Title: string,
		button2Title: string,
		checkMsg: string,
		checkState: boolean,
		aExtraArgs?: any
	): Promise<any>;
	/**
	 * Puts up a dialog with an edit field and an optional, labeled checkbox.
	 *
	 * @param aParent
	 *        The parent window or null.
	 * @param aDialogTitle
	 *        Text to appear in the title of the dialog.
	 * @param aText
	 *        Text to appear in the body of the dialog.
	 * @param aValue
	 *        Contains the default value for the dialog field when this method
	 *        is called (null value is ok).  Upon return, if the user pressed
	 *        OK, then this parameter contains a newly allocated string value.
	 *        Otherwise, the parameter's value is unmodified.
	 * @param aCheckMsg
	 *        Text to appear with the checkbox.  If null, check box will not be shown.
	 * @param aCheckState
	 *        Contains the initial checked state of the checkbox when this method
	 *        is called and the final checked state after this method returns.
	 *
	 * @return true for OK, false for Cancel.
	 */
	prompt(
		parent: Window,
		dialogTitle: string,
		text: string,
		value: string,
		checkMsg: string,
		checkState: boolean
	): boolean;
	/**
	 * Like prompt, but with a BrowsingContext as parent.
	 *
	 * @param aBrowsingContext
	 *        The browsing context the prompt should be opened for.
	 * @param modalType
	 *        Whether the prompt should be window, tab or content modal.
	 */
	promptBC(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		value: string,
		checkMsg: string,
		checkState: boolean
	): boolean;
	/**
	 * Async version of promptBC
	 *
	 * @return A promise which resolves when the prompt is dismissed.
	 *
	 * @resolves nsIPropertyBag { checked: boolean, value: string, ok: boolean }
	 */
	asyncPrompt(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		value: string,
		checkMsg: string,
		checkState: boolean
	): Promise<any>;

	/**
	 * Puts up a dialog with an edit field and a password field.
	 *
	 * @param aParent
	 *        The parent window or null.
	 * @param aDialogTitle
	 *        Text to appear in the title of the dialog.
	 * @param aText
	 *        Text to appear in the body of the dialog.
	 * @param aUsername
	 *        Contains the default value for the username field when this method
	 *        is called (null value is ok).  Upon return, if the user pressed OK,
	 *        then this parameter contains a newly allocated string value.
	 *        Otherwise, the parameter's value is unmodified.
	 * @param aPassword
	 *        Contains the default value for the password field when this method
	 *        is called (null value is ok).  Upon return, if the user pressed OK,
	 *        then this parameter contains a newly allocated string value.
	 *        Otherwise, the parameter's value is unmodified.
	 *
	 * @return true for OK, false for Cancel.
	 */
	promptUsernameAndPassword(
		parent: Window,
		dialogTitle: string,
		text: string,
		username: string,
		password: string
	): boolean;
	/**
	 * Like promptUsernameAndPassword, but with a BrowsingContext as parent.
	 *
	 * @param aBrowsingContext
	 *        The browsing context the prompt should be opened for.
	 * @param modalType
	 *        Whether the prompt should be window, tab or content modal.
	 */
	promptUsernameAndPasswordBC(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		username: string,
		password: string
	): boolean;
	/**
	 * Async version of promptUsernameAndPasswordBC
	 *
	 * @return A promise which resolves when the prompt is dismissed.
	 *
	 * @resolves nsIPropertyBag { user: string, pass: string, ok: boolean }
	 */
	asyncPromptUsernameAndPassword(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		username: string,
		password: string
	): Promise<any>;

	/**
	 * Puts up a dialog with a password field.
	 *
	 * @param aParent
	 *        The parent window or null.
	 * @param aDialogTitle
	 *        Text to appear in the title of the dialog.
	 * @param aText
	 *        Text to appear in the body of the dialog.
	 * @param aPassword
	 *        Contains the default value for the password field when this method
	 *        is called (null value is ok).  Upon return, if the user pressed OK,
	 *        then this parameter contains a newly allocated string value.
	 *        Otherwise, the parameter's value is unmodified.
	 *
	 * @return true for OK, false for Cancel.
	 */
	promptPassword(
		parent: Window,
		dialogTitle: string,
		text: string,
		password: string
	): boolean;
	/**
	 * Like promptPassword, but with a BrowsingContext as parent.
	 *
	 * @param aBrowsingContext
	 *        The browsing context the prompt should be opened for.
	 * @param modalType
	 *        Whether the prompt should be window, tab or content modal.
	 */
	promptPasswordBC(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		password: string
	): boolean;
	/**
	 * Async version of promptPasswordBC
	 *
	 * @return A promise which resolves when the prompt is dismissed.
	 *
	 * @resolves nsIPropertyBag { pass: string, ok: boolean }
	 */
	asyncPromptPassword(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		password: string
	): Promise<any>;
	/**
	 * Puts up a dialog box which has a list box of strings from which the user
	 * may make a single selection.
	 *
	 * @param aParent
	 *        The parent window or null.
	 * @param aDialogTitle
	 *        Text to appear in the title of the dialog.
	 * @param aText
	 *        Text to appear in the body of the dialog.
	 * @param aSelectList
	 *        The list of strings to display.
	 * @param aOutSelection
	 *        Contains the index of the selected item in the list when this
	 *        method returns true.
	 *
	 * @return true for OK, false for Cancel.
	 */
	select(
		parent: Window,
		dialogTitle: string,
		text: string,
		selectList: string[],
		outSelection: number
	): boolean;
	/**
	 * Like select, but with a BrowsingContext as parent.
	 *
	 * @param aBrowsingContext
	 *        The browsing context the prompt should be opened for.
	 * @param modalType
	 *        Whether the prompt should be window, tab or content modal.
	 */
	selectBC(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		selectList: string[],
		outSelection: number
	): boolean;
	/**
	 * Async version of selectBC
	 *
	 * @return A promise which resolves when the prompt is dismissed.
	 *
	 * @resolves nsIPropertyBag { selected: int, ok: boolean }
	 */
	asyncSelect(
		browsingContext: BrowsingContext,
		modalType: number,
		dialogTitle: string,
		text: string,
		selectList: string[]
	): Promise<any>;

	// NOTE: These functions differ from their nsIAuthPrompt counterparts by
	// having additional checkbox parameters
	//
	// See nsIAuthPrompt2 for documentation on the semantics of the other
	// parameters.
	promptAuth(
		parent: Window,
		channel: nsIChannel,
		level: number,
		authInfo: nsIAuthInformation
	): boolean;
	/**
	 * Like promptAuth, but with a BrowsingContext as parent.
	 *
	 * @param aBrowsingContext
	 *        The browsing context the prompt should be opened for.
	 * @param modalType
	 *        Whether the prompt should be window, tab or content modal.
	 */
	promptAuthBC(
		browsingContext: BrowsingContext,
		modalType: number,
		channel: nsIChannel,
		level: number,
		authInfo: nsIAuthInformation
	): boolean;
	/**
	 * Async version of promptAuthBC
	 *
	 * @return A promise which resolves when the prompt is dismissed.
	 *
	 * @resolves nsIPropertyBag { ok: boolean }
	 */
	asyncPromptAuth(
		browsingContext: BrowsingContext,
		modalType: number,
		channel: nsIChannel,
		level: number,
		authInfo: nsIAuthInformation
	): Promise<any>;

	/**
	 * Displays a contextmenu to get user confirmation for clipboard read. Only
	 * one context menu can be opened at a time.
	 *
	 * @param aWindow
	 *        The window context that initiates the clipboard operation.
	 *
	 * @return A promise which resolves when the contextmenu is dismissed.
	 *
	 * @resolves nsIPropertyBag { ok: boolean }
	 */
	confirmUserPaste(window: Window): Promise<any>;
}
