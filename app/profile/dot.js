#filter dumbComments emptyLines substitution

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

pref("toolkit.defaultChromeURI", "");

pref("devtools.debugger.server-port", 40291);

// Whether to show the dialogs opened at the content level, such as
// alert() or prompt(), using a SubDialogManager in the TabDialogBox.
pref("prompts.contentPromptSubDialog", true);

// Disable Pocket
pref("extensions.pocket.enabled", false);

// Show hidden extensions in about:debugging
pref("devtools.aboutdebugging.showHiddenAddons", true); // @todo: remove this behaviour on official builds

// Disable telemetry
pref("toolkit.telemetry.enabled", false);
pref("toolkit.telemetry.server", "http://host.invalid");

// Enforce HTTPS-only mode
pref("dom.security.https_only_mode", true);

#ifdef MOZ_WIDGET_GTK
// Use system file picker via XDG portals rather than nsFilePicker
// @todo: further investigation for this needed
pref("widget.use-xdg-desktop-portal.file-picker", 1);
#endif