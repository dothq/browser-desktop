import { Services } from "../modules";

export const NEW_TAB_URL = "about:newtab";
export const NEW_TAB_URL_PARSED = Services.io.newURI(NEW_TAB_URL);

export const hideFaviconFor = [
    "about:newtab"
]

export const TAB_LOADING_ICON_URL = `chrome://dot/content/skin/icons/tab/loading.svg`;