/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozElementMixinStatic } from "./MozElementMixin";
import { MozXULElement as MozXULElementInstance } from "./MozXULElement";

interface MozElement<T> {
    prototype: MozXULElementInstance & T;
    new (): MozXULElementInstance & T;
}

interface MozElementsInterface {
    [key: string]: MozElement<Element> & MozElementMixinStatic;
    
}

export type MozElements = {
    MozElementMixin: <T extends Element>(el: T) => MozElement<T> & MozElementMixinStatic;
    BaseTextMixin: <T extends Element>(el: Constructor<T>) => MozElement<T> & MozElementMixinStatic;
} & MozElementsInterface;