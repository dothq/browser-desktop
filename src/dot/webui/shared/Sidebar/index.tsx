import React from "react";

export const Sidebar = ({
    title,
    children
}: {
    title: string;
    children: any;
}) => {
    return (
        <aside className={"webui-sidebar"}>
            <header className={"webui-sidebar-header"}>
                <h1>{title}</h1>
            </header>
            {children}
        </aside>
    );
};
