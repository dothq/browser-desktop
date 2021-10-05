import React from "react";
import { SearchbarButton } from "../SearchbarButton";

export const Identity = ({
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
};
