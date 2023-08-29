/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { L10nArgs } from "./FluentLocalization";

export type L10nResourceId = string | {
    path: string;
    _optional?: boolean;
};

export type L10nKey = { id: string, args?: object };
 
export type AttributeNameValue = {
    name: string;
    value: string;
  };
  
export type L10nMessage = {
    value?: string;
    attributes?: AttributeNameValue[]
};

export interface Localization {
    new(resourceIds: L10nResourceId[], sync?: boolean, registry?: /* @todo L10nRegistry */ any, locales?: string[]): LocalizationInstance;
}

interface LocalizationInstance {
  /**
   * Constructor arguments:
   *    - aResourceids         - a list of localization resource URIs
   *                             which will provide messages for this
   *                             Localization instance.
   *    - aSync                - Specifies if the initial state of the Localization API is synchronous.
   *                             This enables a number of synchronous methods on the
   *                             Localization API.
   *    - aRegistry            - optional custom L10nRegistry to be used by this Localization instance.
   *    - aLocales             - custom set of locales to be used for this Localization.
   */

  /**
   * A method for adding resources to the localization context.
   */
  addResourceIds(resourceIds: L10nResourceId[]): undefined;

  /**
   * A method for removing resources from the localization context.
   *
   * Returns a new count of resources used by the context.
   */
  removeResourceIds(resourceIds: L10nResourceId[]): number;

  /**
   * Formats a value of a localization message with a given id.
   * An optional dictionary of arguments can be passed to inform
   * the message formatting logic.
   *
   * Example:
   *    let value = await document.l10n.formatValue("unread-emails", {count: 5});
   *    assert.equal(value, "You have 5 unread emails");
   */
   formatValue(id: string, args?: L10nArgs): Promise<string | null>;

  /**
   * Formats values of a list of messages with given ids.
   *
   * Example:
   *    let values = await document.l10n.formatValues([
   *      {id: "hello-world"},
   *      {id: "unread-emails", args: {count: 5}
   *    ]);
   *    assert.deepEqual(values, [
   *      "Hello World",
   *      "You have 5 unread emails"
   *    ]);
   */
  formatValues(keys: L10nKey[]): Promise<(string | null)[]>;

  /**
   * Formats values and attributes of a list of messages with given ids.
   *
   * Example:
   *    let values = await document.l10n.formatMessages([
   *      {id: "hello-world"},
   *      {id: "unread-emails", args: {count: 5}
   *    ]);
   *    assert.deepEqual(values, [
   *      {
   *        value: "Hello World",
   *        attributes: null
   *      },
   *      {
   *        value: "You have 5 unread emails",
   *        attributes: {
   *          tooltip: "Click to select them all"
   *        }
   *      }
   *    ]);
   */
  formatMessages(keys: L10nKey[]): Promise<(L10nMessage | null)[]>;

  setAsync(): undefined;

  formatValueSync(id: string, args?: L10nArgs): string | null;

  formatValuesSync(keys: L10nKey[]): (string | null)[];

  formatMessagesSync(keys: L10nKey[]): (string | null)[];
}