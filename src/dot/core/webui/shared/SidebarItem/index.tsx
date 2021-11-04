import React from "react";

export const SidebarItem = ({
    id,
    text,
    icon,
    active
}: {
    id: string;
    text: string;
    icon: string;
    active: boolean;
}) => {
    return (
        <a
            id={id}
            className={"webui-sidebar-item"}
            href={`#${id}`}
            data-active={active}
        >
            <i
                className={"webui-sidebar-item-icon"}
                style={{
                    backgroundImage: `url(${icon})`
                }}
            ></i>

            <span>{text}</span>
        </a>
    );
};
