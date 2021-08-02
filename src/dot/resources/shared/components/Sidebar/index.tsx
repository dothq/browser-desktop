import React from "react"
import { MiniSearch } from "../MiniSearch"

interface Props {
    title: string,
    children?: any
}

export const Sidebar = ({ title, children }: Props) => {
    return (
        <aside className={"webui-sidebar"}>
            <div className={"webui-sidebar-container"}>
                <h1 className={"webui-sidebar-title"}>
                    {title}
                </h1>

                <MiniSearch placeholder={`Search ${title.toLowerCase()}…`} />

                {children}
            </div>
        </aside>
    )
}