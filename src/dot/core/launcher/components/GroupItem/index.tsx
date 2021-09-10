import React from "react"

export const GroupItem = ({
    title,
    subtitle,
    icon,
    active,
    onMouseOver
}: {
    title: string,
    subtitle?: string,
    icon: any,
    active?: boolean,
    onMouseOver?: any
}) => {
    return (
        <a className={"launcher-result-group-item"} onMouseOver={onMouseOver}>
            <i className={"launcher-result-group-item-icon"} style={{
                backgroundImage: `url(${icon})`
            }} />

            <div className={"launcher-result-group-item-text"}>
                <span className={"groupitem-text-title"}>
                    {title}
                </span>

                {subtitle && <span className={"groupitem-text-subtitle"}>
                    {subtitle}
                </span>}
            </div>
        </a>
    )
}