import { dot } from "../api";

export const openMenuAt = ({
    name,
    id,
    bounds,
    ctx
}: {
    name: string;
    id?: string;
    bounds?: [number, number];
    ctx: any;
}) => {
    if (dot.menus.visibleMenu)
        return dot.menus.clear(true);

    const data: any = {};

    if (id) data.el = document.getElementById(id);
    else if (bounds) {
        data.x = bounds[0];
        data.y = bounds[1];
    }

    dot.menus.create(name, data, ctx);
};
