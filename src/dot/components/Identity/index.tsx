import { observer } from "mobx-react";
import React from "react";
import { SearchbarButton } from "../SearchbarButton";

export const Identity = observer(
    ({
        type,
        onClick,
        selected,
        title
    }: {
        type: string;
        onClick?: any;
        selected?: boolean;
        title?: string;
    }) => {
        return (
            <SearchbarButton
                id={"identity-icon-box"}
                className={type}
                title={title}
                onClick={onClick}
                selected={selected}
            />
        );
    }
);
