#filter dumbComments emptyLines substitution

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

pref("toolkit.defaultChromeURI", "chrome://dot/content/browser.html");

/* debugging prefs, disable these before you deploy your application! */
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);

pref("devtools.debugger.server-port", 40291);

// Whether to show the dialogs opened at the content level, such as
// alert() or prompt(), using a SubDialogManager in the TabDialogBox.
pref("prompts.contentPromptSubDialog", true);
