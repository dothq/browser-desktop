import { ContextMenuProps } from "../menus";
import { Menu } from "../models/Menu";

export class MenuAPI {
    public list: Menu[] = []

    public register(data: ContextMenuProps) {
        const menu = new Menu(data.id);

        this.list.push(menu);
    }

    public get(menuId: string) {
        return this.list.find(menu => menu.id == menuId);
    }

    public open(menuId: string, x?: number, y?: number) {
        const menu = this.get(menuId);
        
        if (menu) {
            menu.open(x || 0, y || 0);
        }
    }

    public close(menuId: string) {
        const menu = this.get(menuId);
        
        if (menu) {
            menu.close();
        }
    }
}