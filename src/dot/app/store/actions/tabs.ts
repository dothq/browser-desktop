import { Services } from "../../../modules";

export const closeTabAction = (
    store: any,
    id: number
) => {
    const tab = store.getTabById(id);

    tab.isClosing = true;
};

export const navigateTabAction = (
    store: any,
    payload: any
) => {
    const { id, url, triggeringPrincipal } = payload;

    const tab = store.getTabById(id);

    if (tab) {
        const uri = Services.io.newURI(url);

        tab.goto(uri, { triggeringPrincipal });
    }
};

export const bookmarkTabAction = (
    store: any,
    payload: any
) => {
    const { id } = payload;

    const tab = store.getTabById(id);

    if (tab) {
        const bookmarked = tab.bookmarked;

        if (bookmarked) tab.unBookmark();
        else tab.bookmark();

        store.update(id, { bookmarked: !bookmarked });
    }
};

export const updateTitleTabAction = (
    store: any,
    payload: any
) => {
    const { id, title, noInvalidate } = payload;

    store.update(id, { title, noInvalidate });
};

export const updateUrlTabAction = (
    store: any,
    payload: any
) => {
    const { id, url, urlParts } = payload;

    store.update(id, { url, urlParts });
};

export const updateStateTabAction = (
    store: any,
    payload: any
) => {
    const { id, state, noInvalidate } = payload;

    store.update(id, { state, noInvalidate });
};

export const updateFaviconTabAction = (
    store: any,
    payload: any
) => {
    const { id, faviconUrl } = payload;

    store.update(id, { faviconUrl });
};

export const updateNavigationStateAction = (
    store: any,
    payload: any
) => {
    const { id, canGoBack, canGoForward } = payload;

    store.update(id, { canGoBack, canGoForward });
};
