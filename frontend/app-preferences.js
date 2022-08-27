pref("toolkit.defaultChromeURI", "chrome://dot/content/index.xhtml");

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
