/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

type L10nArgs = Record<string, any>;

export interface FluentLocalization {
    formatValue(id: string, args?: L10nArgs): Promise<string | null>;
    formatValues(ids: string[], args?: L10nArgs): Promise<string[] | null[]>;

    formatValueSync(id: string, args?: L10nArgs): string | null;
    formatValuesSync(ids: string[], args?: L10nArgs): string[] | null[];

    /**
     * This function sets the attributes data-l10n-id and possibly data-l10n-args
     * on the element.
     */
    setAttributes(
        target: Element,
        id?: string,
        args?: Record<string, string>
    ): void;
}