import { ContextMenuProps } from "../menus";

export class MenuAPI {
    private loadedMenus: ContextMenuProps[] = []

    public register(data: ContextMenuProps) {
        if (!data.element) throw new Error("Menu must have a element attached.");

        this.loadedMenus.push(data);
    }

    public get(menuId: string) {
        return this.loadedMenus.find(menu => menu.id == menuId);
    }

    public open(menuId: string) {
        const menu = this.get(menuId);
        if (!menu || !menu.element) return;

        menu?.element.setAttribute("open", "true");
    }
}