/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import createCache from "@emotion/cache";
import { injectGlobal } from "@emotion/css";
import { CacheProvider } from "@emotion/react";
import { BrowserToolboxLauncher } from "mozilla";
import React, { PureComponent } from "react";
import ErrorBoundary from "../errors/ErrorBoundary";
import BrowserFrame from "../frame/BrowserFrame";
import TabBar from "../tabbar/TabBar";
import { GlobalStyle } from "./Application.style";

const cache = createCache({ key: "browser" });

injectGlobal`${GlobalStyle}`;

class Application extends PureComponent {
	public constructor(props: {}) {
		super(props);
	}

	public async componentDidMount() {
		BrowserToolboxLauncher.init();
	}

	public render() {
		return (
			<CacheProvider value={cache}>
				<ErrorBoundary>
					<TabBar />
					<BrowserFrame />
				</ErrorBoundary>
			</CacheProvider>
		);
	}
}

export default Application;
