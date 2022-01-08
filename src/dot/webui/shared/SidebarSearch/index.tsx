import React from "react";

export const SidebarSearch = (props: any) => {
    return (
        <div className={"webui-sidebar-search"}>
            <i className={"search-icon"} />
            <input {...props}></input>
        </div>
    );
};
