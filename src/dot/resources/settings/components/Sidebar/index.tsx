import React from "react"

export const Sidebar = ({ title, children }: { title: string, children?: any }) => {
    return (
        <aside className={"webui-sidebar"}>
            <div className={"webui-sidebar-container"}>
                <h1 className={"webui-sidebar-title"}>
                    {title}
                </h1>

                <div className={"mini-searchbox"}>
                    <i className={"mini-searchbox-icon"}></i>
                    <input
                        className={"mini-searchbox-input"}
                        type={"text"}
                        placeholder={`Search ${title.toLowerCase()}…`}
                    ></input>
                </div>

                {children}
            </div>
        </aside>
    )
}