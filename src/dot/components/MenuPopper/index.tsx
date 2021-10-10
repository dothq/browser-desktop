import React from "react";
import { dot } from "../../api";

export const MenuPopper = ({
    children,
    menu,
    ctx
}: {
    children: any;
    menu: string;
    ctx?: any;
}) => {
    const childRef = React.useRef<HTMLElement>();
    const [open, setOpen] = React.useState(false);
    const [id, setId] = React.useState("");

    React.useEffect(() => {
        if (
            dot.menus.visibleMenu &&
            dot.menus.visibleMenuId == id
        ) {
            // menu is open + it is the correct menu
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [dot.menus.visibleMenu]);

    const onClick = () => {
        if (!childRef.current) return;

        const { x, y, width, height } =
            childRef.current.getBoundingClientRect();

        const templated = dot.menus.create(
            menu,
            { x: x + width, y: y + height },
            ctx || {}
        );

        if (templated) setId(templated.id);
    };

    return (
        <>
            {React.cloneElement(
                React.Children.only(children),
                {
                    ref: childRef,
                    onClick,
                    "data-menu-open": open
                        ? true
                        : undefined
                }
            )}
        </>
    );
};
