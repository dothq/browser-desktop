import React from "react";
import { useDispatch } from "react-redux";

export const Sidebar = ({
    title,
    children
}: {
    title: string;
    children: any;
}) => {
    const dispatch = useDispatch();

    return (
        <aside className={"webui-sidebar"}>
            <header className={"webui-sidebar-header"}>
                <h1>{title}</h1>
            </header>
            {children}
        </aside>
    );
};
