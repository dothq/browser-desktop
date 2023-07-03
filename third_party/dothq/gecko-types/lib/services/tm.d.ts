/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIThread } from "../nsIThread";

export interface ServicesTm {
	/**
	 * Create a new thread (a global, user PRThread) with the specified name.
	 *
	 * @param name
	 *   The name of the thread. If it is empty the thread will not be named.
	 * @param options
	 *   Configuration options for the newly created thread.
	 *
	 * @returns
	 *   The newly created nsIThread object.
	 */
	newNamedThread(name: string, options: any): nsIThread;

	/**
	 * Get the main thread.
	 */
	readonly mainThread: nsIThread;

	/**
	 * Get the current thread.  If the calling thread does not already have a
	 * nsIThread associated with it, then a new nsIThread will be created and
	 * associated with the current PRThread.
	 */
	currentThread: nsIThread;

	/**
	 * This queues a runnable to the main thread. It's a shortcut for JS callers
	 * to be used instead of
	 *   .mainThread.dispatch(runnable, Ci.nsIEventTarget.DISPATCH_NORMAL);
	 * or
	 *   .currentThread.dispatch(runnable, Ci.nsIEventTarget.DISPATCH_NORMAL);
	 * C++ callers should instead use NS_DispatchToMainThread.
	 */
	dispatchToMainThread(
		event: any /* @todo nsIRunnable */,
		priority?: number
	): void;

	/**
	 * Similar to dispatchToMainThread, but wraps the event with extra
	 * runnable that allocates nsAutoMicroTask.
	 */
	dispatchToMainThreadWithMicroTask(
		event: any /* @todo nsIRunnable */,
		priority?: number
	): void;

	/**
	 * This queues a runnable to the main thread's idle queue.
	 *
	 * @param event
	 *   The event to dispatch.
	 * @param timeout
	 *   The time in milliseconds until this event should be moved from the idle
	 *   queue to the regular queue if it hasn't been executed by then.  If not
	 *   passed or a zero value is specified, the event will never be moved to
	 *   the regular queue.
	 */
	idleDispatchToMainThread(
		event: any /* @todo nsIRunnable */,
		timeout?: number
	): void;

	/*
	 * A helper method to dispatch a task through nsIDirectTaskDispatcher to the
	 * current thread.
	 */
	dispatchDirectTaskToCurrentThread(
		event: any /* @todo nsIRunnable */
	): void;

	/**
	 * Enter a nested event loop on the current thread, waiting on, and
	 * processing events until condition.isDone() returns true.
	 *
	 * If condition.isDone() throws, this function will throw as well.
	 *
	 * C++ code should not use this function, instead preferring
	 * mozilla::SpinEventLoopUntil.
	 */
	spinEventLoopUntil(
		aVeryGoodReasonToDoThis: string,
		condition: any /* @todo nsINestedEventLoopCondition */
	): void;

	/**
	 * Similar to the previous method, but the spinning of the event loop
	 * terminates when the quit application shutting down starts.
	 *
	 * C++ code should not use this function, instead preferring
	 * mozilla::SpinEventLoopUntil.
	 */
	spinEventLoopUntilOrQuit(
		aVeryGoodReasonToDoThis: string,
		condition: any /* @todo nsINestedEventLoopCondition */
	): void;

	/**
	 * Spin the current thread's event loop until there are no more pending
	 * events.  This could be done with spinEventLoopUntil, but that would
	 * require access to the current thread from JavaScript, which we are
	 * moving away from.
	 */
	spinEventLoopUntilEmpty(): void;

	/**
	 * Return the EventTarget for the main thread.
	 */
	mainThreadEventTarget: any /* @todo nsIEventTarget */;
}
