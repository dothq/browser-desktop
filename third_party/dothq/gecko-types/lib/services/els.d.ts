/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

interface EventListenerInfo {
    /**
     * The type of the event for which the listener was added.
     * Null if the listener is for all the events.
     */
    readonly type: string;
    readonly capturing: boolean;
    readonly allowsUntrusted: boolean;
    readonly inSystemEventGroup: boolean;

    /**
     * Changing the enabled state works only with listeners implemented in
     * JS. An error is thrown for native listeners.
     */
    enabled: boolean;

    /**
     * The underlying JS object of the event listener, if this listener
     * has one.  Null otherwise.
     */
    readonly listenerObject?: any;

    /**
     * Tries to serialize event listener to a string.
     * Returns null if serialization isn't possible
     * (for example with C++ listeners).
     */
    toSource(): string;
}

interface ListenerChangeListener {
    listenersChanged(aEventListenerChanges: any[]): void;
}

export interface ServicesEls {
    /**
     * Returns an array of nsIEventListenerInfo objects.
     * If aEventTarget doesn't have any listeners, this returns null.
     */
    getListenerInfoFor(aEventTarget: EventTarget): Array<EventListenerInfo>;

    /**
     * Returns an array of event targets.
     * aEventTarget will be at index 0.
     * The objects are the ones that would be used as DOMEvent.currentTarget while
     * dispatching an event to aEventTarget
     * @note Some events, especially 'load', may actually have a shorter
     *       event target chain than what this methods returns.
     */
    getEventTargetChainFor(aEventTarget: EventTarget, composed: boolean): Array<EventTarget>;
 
    /**
     * Returns true if a event target has any listener for the given type.
     */
    hasListenersFor(aEventTarget: EventTarget, aType: string): boolean;
 
    /**
     * Add a system-group eventlistener to a event target.
     */
    addSystemEventListener(target: EventTarget,
                                type: string,
                                listener: any,
                                useCapture: boolean): void;
 
    /**
     * Remove a system-group eventlistener from a event target.
     */
    removeSystemEventListener(target: EventTarget,
                                type: string,
                                listener: any,
                                useCapture: boolean): void;
 
    addListenerForAllEvents(target: EventTarget,
                                listener: any,
                                aUseCapture?: boolean,
                                aWantsUntrusted?: boolean,
                                aSystemEventGroup?: boolean): void;
 
    removeListenerForAllEvents(target: EventTarget,
                                    listener: any,
                                    aUseCapture?: boolean,
                                    aSystemEventGroup?: boolean): void;
 
    addListenerChangeListener(aListener: ListenerChangeListener);
    removeListenerChangeListener(aListener: ListenerChangeListener);
}