import React from "react";

export const SidebarSearch = (
    props: React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    >
) => {
    return (
        <div className={"webui-sidebar-search"}>
            <i className={"search-icon"} />
            <input {...props}></input>
        </div>
    );
};
