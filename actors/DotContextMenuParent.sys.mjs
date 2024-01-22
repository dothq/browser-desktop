/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserMenu } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserMenu.sys.mjs"
);

export class DotContextMenuParent extends JSWindowActorParent {
	/** @param {import("third_party/dothq/gecko-types/lib").ReceiveMessageArgument<>} message  */
	receiveMessage(message) {
		if (message.name !== "contextmenu") return;

		const browser = this.manager.rootFrameLoader.ownerElement;
		const win = browser.ownerGlobal;

		// Make sure this browser belongs to us before we open the panel
		if (win.gDot.tabs.getTabForWebContents(browser)) {
			const { x, y, context } = message.data;

			const menu = new BrowserMenu(win);
			menu.append(
				new BrowserMenu.MenuItemGroup(
					new BrowserMenu.MenuItem({
						commandId: "go-back"
					}),
					new BrowserMenu.MenuItem({
						commandId: "go-forward"
					}),
					new BrowserMenu.MenuItem({
						commandId: "reload-tab"
					}),
					new BrowserMenu.MenuItem({
						label: "Bookmark page...",
						image: "chrome://dot/skin/icons/star.svg",
						accelerator: "Ctrl+D",
						click: (child) => console.log(child.id, child)
					})
				),
				new BrowserMenu.MenuItem({
					type: "separator"
				}),
				new BrowserMenu.MenuItem({
					commandId: "save-page-as"
				}),
				new BrowserMenu.MenuItem({
					label: "Send page to device...",
					accessKey: "n",
					submenu: [
						new BrowserMenu.MenuItem({
							label: "Dot Browser on Android"
						}),
						new BrowserMenu.MenuItem({
							label: "Dot Browser on Fedora 39"
						})
					]
				}),
				new BrowserMenu.MenuItem({
					label: "Select all",
					accelerator: "Ctrl+A",
					accessKey: "a",
					click: (child) => console.log(child.id, child)
				}),
				new BrowserMenu.MenuItem({
					type: "separator"
				}),
				new BrowserMenu.MenuItem({
					label: "Take screenshot...",
					image: "chrome://dot/skin/icons/screenshot.svg",
					accessKey: "t",
					click: (child) => console.log(child.id, child)
				}),
				new BrowserMenu.MenuItem({
					label: "Print...",
					image: "chrome://dot/skin/icons/print.svg",
					accelerator: "Ctrl+P",
					accessKey: "i",
					click: (child) => console.log(child.id, child)
				}),
				new BrowserMenu.MenuItem({
					type: "separator"
				}),
				new BrowserMenu.MenuItem({
					label: "View page source",
					accelerator: "Ctrl+U",
					accessKey: "v",
					click: (child) => console.log(child.id, child)
				}),
				new BrowserMenu.MenuItem({
					label: "Inspect...",
					image: "chrome://dot/skin/icons/inspect.svg",
					submenu: [
						new BrowserMenu.MenuItemGroup(
							new BrowserMenu.MenuItem({
								label: "Inspect",
								image: "chrome://dot/skin/icons/inspect.svg",
								click: (child) => console.log(child.id, child)
							}),
							new BrowserMenu.MenuItem({
								label: "Console",
								image: "chrome://dot/skin/icons/terminal.svg",
								click: (child) => console.log(child.id, child)
							}),
							new BrowserMenu.MenuItem({
								label: "Network",
								image: "chrome://dot/skin/icons/network.svg",
								click: (child) => console.log(child.id, child)
							}),
							new BrowserMenu.MenuItem({
								label: "Performance",
								image: "chrome://dot/skin/icons/speedometer.svg",
								click: (child) => console.log(child.id, child)
							})
						),
						new BrowserMenu.MenuItem({
							type: "separator"
						}),
						new BrowserMenu.MenuItem({
							label: "Inspect accessibility",
							image: "chrome://dot/skin/icons/inspect-accessibility.svg"
						}),
						new BrowserMenu.MenuItem({
							label: "Memory",
							image: "chrome://dot/skin/icons/memory.svg"
						}),
						new BrowserMenu.MenuItem({
							label: "Storage",
							image: "chrome://dot/skin/icons/cabinet.svg"
						}),
						new BrowserMenu.MenuItem({
							label: "Application",
							image: "chrome://dot/skin/icons/grid.svg"
						}),
						new BrowserMenu.MenuItem({
							type: "separator"
						}),
						new BrowserMenu.MenuItem({
							commandId: "toggle-colorpicker"
						}),
						new BrowserMenu.MenuItem({
							type: "checkbox",
							label: "Ruler",
							image: "chrome://dot/skin/icons/ruler.svg"
						}),
						new BrowserMenu.MenuItem({
							type: "checkbox",
							label: "Responsive Design mode",
							image: "chrome://dot/skin/icons/devices.svg"
						}),
						new BrowserMenu.MenuItem({
							type: "separator"
						}),
						new BrowserMenu.MenuItem({
							type: "radio",
							label: "Prefer system theme",
							checked: true
						}),
						new BrowserMenu.MenuItem({
							type: "radio",
							label: "Prefer light theme",
							image: "chrome://dot/skin/icons/sun.svg"
						}),
						new BrowserMenu.MenuItem({
							type: "radio",
							label: "Prefer dark theme",
							image: "chrome://dot/skin/icons/moon.svg"
						})
					]
				})
			);

			menu.open(x, y);
		}
	}

	hiding() {
		try {
			this.sendAsyncMessage("ContextMenu:Hiding", {});
		} catch (e) {
			// This will throw if the content goes away while the
			// context menu is still open.
		}
	}
}
