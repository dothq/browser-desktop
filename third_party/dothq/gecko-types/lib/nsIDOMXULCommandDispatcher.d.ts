/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface nsIController {
	isCommandEnabled(command: string): boolean;
	supportsCommand(command: string): boolean;

	doCommand(command: string): void;

	onEvent(eventName: string): void;
}

export interface nsIControllers {
	getControllerForCommand(command: string): nsIController;

	insertControllerAt(index: number, controller: nsIController);
	removeControllerAt(index: number): nsIController;
	getControllerAt(index: number): nsIController;

	appendController(controller: nsIController): void;
	removeController(controller: nsIController): void;

	/*
        Return an ID for this controller which is unique to this
        nsIControllers.
    */
	getControllerId(controller: nsIController): number;
	/*
        Get the controller specified by the given ID.
    */
	getControllerById(controllerID: number): nsIController;

	getControllerCount(): number;
}

export interface nsIDOMXULCommandDispatcher {
	focusedElement: Element;
	focusedWindow: Window;

	addCommandUpdater(
		updater: Element,
		events: string,
		targets: string
	): void;
	removeCommandUpdater(updater: Element): void;

	updateCommands(eventName: string): void;

	getControllerForCommand(command: string): nsIController;
	getControllers(): nsIControllers;

	advanceFocus(): void;
	rewindFocus(): void;
	advanceFocusIntoSubtree(elt: Element): void;

	// When locked, command updating is batched until unlocked. Always ensure that
	// lock and unlock is called in a pair.
	lock(): void;
	unlock(): void;
}
