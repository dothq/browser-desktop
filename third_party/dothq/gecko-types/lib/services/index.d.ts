/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIPrefBranch } from "../nsIPrefBranch";
import { ServicesAppInfo } from "./appinfo";
import { ServicesEls } from "./els";
import { ServicesFocus } from "./focus";
import { ServicesIo } from "./io";
import { ServicesObs } from "./obs";
import { ServicesPolicies } from "./policies";
import { ServicesProfiler } from "./profiler";
import { ServicesScriptloader } from "./scriptloader";
import { ServicesSearch } from "./search";
import { ServicesStartup } from "./startup";
import { ServicesTextToSubURI } from "./textToSubURI";
import { ServicesWm } from "./wm";

export type Services = {
	appinfo: ServicesAppInfo;
	prefs: nsIPrefBranch;
	profiler: ServicesProfiler;
	obs: ServicesObs;
	wm: ServicesWm;
	els: ServicesEls;
	focus: ServicesFocus;
	io: ServicesIo;
	policies: ServicesPolicies;
	textToSubURI: ServicesTextToSubURI;
	scriptloader: ServicesScriptloader;
	scriptSecurityManager: any;
	search: ServicesSearch;
	startup: ServicesStartup;
};
