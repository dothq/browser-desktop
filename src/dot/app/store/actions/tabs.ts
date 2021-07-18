import { Services } from "../../../modules";

export const closeTabAction = (store: any, id: number) => {
    const tab = store.getTabById(id);

    if (tab) {
        tab.destroy();
        store.list.remove(tab);
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