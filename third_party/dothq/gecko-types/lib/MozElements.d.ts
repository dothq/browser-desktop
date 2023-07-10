/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozElementMixinStatic } from "./MozElementMixin";
import { MozXULElement as MozXULElementInstance } from "./MozXULElement";

type MozElement = {
    prototype: MozXULElementInstance;
    new (): MozXULElementInstance;
} & MozElementMixinStatic;

interface MozElementsInterface {
    [key: string]: MozElement;
    
}

export type MozElements = {
    MozElementMixin: (el: Element) => MozElement;
} & MozElementsInterface;