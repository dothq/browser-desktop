import React from "react";
import { dot } from "../../api";
import OutsideClickHandler from "../../third-party/react-outside-click-handler/OutsideClickHandler";

export const ContextMenu = ({ id, children }: { id: string, children: any }) => {
    const onMenuKeyUp = (e: any) => {
        if (e.keyCode == 27) { // ESC
            dot.menus.clear(true);
        }
    }

    return (
        <OutsideClickHandler
            onOutsideMouseDown={() => dot.menus.clear()}
        >
            <menu id={id} onKeyUp={(e) => onMenuKeyUp(e)}>
                {children}
            </menu>
        </OutsideClickHandler>
    )
};