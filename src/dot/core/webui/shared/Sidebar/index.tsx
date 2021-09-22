import React from "react"
import { Section } from "../../settings/sections"

const SidebarItem = ({ id, name, icon }: Section) => {
    return (
        <a className={"webui-sidebar-item"} href={id}>
            <i style={{
                backgroundImage: `url(${icon})`
            }}></i>

            <span>{name}</span>
        </a>
    )
}

export const Sidebar = ({ title, items }: { title: string, items: any[] }) => {
    return (
        <aside className={"webui-sidebar"}>
            <header className={"webui-sidebar-header"}>
                <h1>{title}</h1>
            </header>
            <ul>
                {items.map(i => (
                    <li key={i.id}>
                        <SidebarItem {...i} />
                    </li>
                ))}
            </ul>
        </aside>
    )
}