import { Services } from "../../../modules";

export const closeTabAction = (store: any, id: number) => {
    const tab = store.getTabById(id);

    if (tab && store.list.indexOf(tab) !== -1) {
        const index = store.list.indexOf(tab);

        if (store.list[index - 1]) {
            store.list.splice(index, 1);
            tab.destroy();

            store.selectedId = store.list[index - 1].id;
        } else if (store.list[index + 1]) {
            store.list.splice(index, 1);
            tab.destroy();

            store.selectedId = store.list[index + 1].id;
        } else if ((store.list.length - 1) == 0) {
            window.close();
        }
    }
}

export const navigateTabAction = (store: any, payload: any) => {
    const {
        id,
        url,
        triggeringPrincipal
    } = payload;

    const tab = store.getTabById(id);

    if (tab) {
        const uri = Services.io.newURI(url);

        tab.goto(
            uri,
            { triggeringPrincipal }
        );
    }
}

export const bookmarkTabAction = (store: any, payload: any) => {
    const {
        id
    } = payload;

    const tab = store.getTabById(id);

    if (tab) {
        tab.bookmark();

        store.update(id, { bookmarked: true });
    }
}

export const updateTitleTabAction = (store: any, payload: any) => {
    const {
        id,
        title,
        noInvalidate
    } = payload;

    store.update(id, { title, noInvalidate });
}

export const updateUrlTabAction = (store: any, payload: any) => {
    const {
        id,
        url,
        urlParts
    } = payload;

    store.update(id, { url, urlParts });
}

export const updateStateTabAction = (store: any, payload: any) => {
    const {
        id,
        state,
        noInvalidate
    } = payload;

    store.update(id, { state, noInvalidate });
}

export const updateFaviconTabAction = (store: any, payload: any) => {
    const {
        id,
        faviconUrl
    } = payload;

    store.update(id, { faviconUrl });
}

export const updateNavigationStateAction = (store: any, payload: any) => {
    const {
        id,
        canGoBack,
        canGoForward
    } = payload;

    console.log("updatenavigationstateaction", id, canGoBack, canGoForward);

    store.update(id, { canGoBack, canGoForward });
}