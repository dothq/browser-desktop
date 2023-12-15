/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIPrefBranch } from "../nsIPrefBranch";
import { ServicesAppInfo } from "./appinfo";
import { ServicesAppShell } from "./appshell";
import { ServicesConsole } from "./console";
import { ServicesDirsvc } from "./dirsvc";
import { ServicesEls } from "./els";
import { ServicesFocus } from "./focus";
import { ServicesIo } from "./io";
import { ServicesLogins } from "./logins";
import { ServicesObs } from "./obs";
import { ServicesPolicies } from "./policies";
import { ServicesPPMM } from "./ppmm";
import { ServicesProfiler } from "./profiler";
import { ServicesPrompt } from "./prompt";
import { ServicesScriptloader } from "./scriptloader";
import { ServicesSearch } from "./search";
import { ServicesStartup } from "./startup";
import { ServicesTextToSubURI } from "./textToSubURI";
import { ServicesTm } from "./tm";
import { ServicesUriFixup } from "./uriFixup";
import { ServicesURLFormatter } from "./urlFormatter";
import { ServicesWm } from "./wm";
import { ServicesWw } from "./ww";

export type Services = {
	appinfo: ServicesAppInfo;
	appShell: ServicesAppShell;
    console: ServicesConsole;
    dirsvc: ServicesDirsvc;
	els: ServicesEls;
	focus: ServicesFocus;
	io: ServicesIo;
	logins: ServicesLogins;
	obs: ServicesObs;
	policies: ServicesPolicies;
	ppmm: ServicesPPMM;
	prefs: nsIPrefBranch;
	profiler: ServicesProfiler;
    prompt: ServicesPrompt;
	scriptloader: ServicesScriptloader;
	scriptSecurityManager: any;
	search: ServicesSearch;
	startup: ServicesStartup;
	textToSubURI: ServicesTextToSubURI;
    tm: ServicesTm;
	uriFixup: ServicesUriFixup;
    urlFormatter: ServicesURLFormatter;
	wm: ServicesWm;
	ww: ServicesWw;
};
