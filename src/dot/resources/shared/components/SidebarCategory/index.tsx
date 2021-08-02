import React from "react"

export const SidebarCategory = ({ label, icon, selected, onClick }: { label: string, icon: string, selected?: boolean, onClick?: any }) => {
    return (
        <div className={"webui-sidebar-category"} data-selected={selected} onClick={onClick}>
            <i
                className={"webui-sidebar-category-icon"}
                style={{ backgroundImage: `url(${icon})` }}
            ></i>

            <label className={"webui-sidebar-category-label"}>
                {label}
            </label>
        </div>
    )
}