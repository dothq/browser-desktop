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

export const updateTitleTabAction = (store: any, payload: any) => {
    const {
        id,
        title
    } = payload;

    store.update(id, { title });
}

export const updateStateTabAction = (store: any, payload: any) => {
    const {
        id,
        state
    } = payload;

    store.update(id, { state });
}

export const updateFaviconTabAction = (store: any, payload: any) => {
    const {
        id,
        faviconUrl
    } = payload;

    store.update(id, { faviconUrl });
}