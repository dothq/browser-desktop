/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { DetailedHTMLProps, LegacyRef } from "react";

type GenericProps = DetailedHTMLProps<
	React.HTMLAttributes<HTMLElement>,
	HTMLElement
>;

interface BrowserProps extends GenericProps {
	children?: any; // No children allowed.
	ref?: LegacyRef<any>;

	remote?: string;
	autoscroll?: string;
	disablehistory?: string;
	disablefullscreen?: string;
	tooltip?: string;
	selectmenulist?: string;
	type?: "content";
	src?: string;
	primary?: string;
	remoteType?: "web";
	messagemanagergroup?: string;
	message?: string;
	contextmenu?: string;
	initiallyactive?: string;
	usercontextid?: number;
	isPreloadBrowser?: string;
	initialBrowsingContextGroupId?: number;
	openWindowInfo?: object;
	maychangeremoteness?: string;
}

function createBrowser({
	remote,
	autoscroll,
	disablehistory,
	disablefullscreen,
	tooltip,
	selectmenulist,
	type,
	src,
	primary,
	remoteType,
	messagemanagergroup,
	message,
	contextmenu,
	initiallyactive,
	usercontextid,
	isPreloadBrowser,
	initialBrowsingContextGroupId,
	openWindowInfo,
	maychangeremoteness,
}: BrowserProps) {
	const browser = document.createXULElement("browser");
}
