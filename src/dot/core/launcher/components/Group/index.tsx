import React from "react";
import { categoryIcons } from "../../utils/category-icons";

export const Group = ({
    id,
    heading,
    children
}: {
    id: string;
    heading: string;
    children: any;
}) => {
    return (
        <div
            className={"launcher-result-group"}
            id={`launcher-group-${id}`}
        >
            <h3
                className={
                    "launcher-result-group-heading"
                }
                style={
                    {
                        "--group-icon": `url(${categoryIcons[id]})`
                    } as any
                }
            >
                {heading}
            </h3>

            <div
                className={
                    "launcher-result-group-contents"
                }
            >
                {children}
            </div>
        </div>
    );
};
