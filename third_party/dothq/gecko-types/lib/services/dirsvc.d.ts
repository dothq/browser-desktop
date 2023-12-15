/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIDirectoryService } from "../nsIDirectoryService";
import { nsIDirectoryServiceProvider2 } from "../nsIDirectoryServiceProvider";
import { nsIFile } from "../nsIFile";
import { nsIProperties } from "../nsIProperties";

export type ServicesDirsvc = nsIDirectoryService & nsIProperties & nsIDirectoryServiceProvider2;