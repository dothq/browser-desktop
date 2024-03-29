import React from "react"

export const PopupHeader = ({ title }: { title: string }) => {
    return (
        <main className={"ui-popup-dialog-header"}>
            <h1 className={"ui-popup-dialog-header-title"}>{title}</h1>
        </main>
    )
}

export const PopupScreen = ({ title, children }: { title: string, children?: any }) => {
    return (
        <>
            <PopupHeader title={title} />

            {children}
        </>
    )
}

export const PopupItem = ({ icon, title, subtitle, colour, noHover }: { icon?: string, title: string, subtitle?: string, colour?: string, noHover?: boolean }) => {
    return (
        <a className={"ui-popup-dialog-item"} style={{
            backgroundColor: noHover ? `transparent !important` : ``
        }}>
            <i
                className={"ui-popup-dialog-item-icon"}
                style={{
                    backgroundImage: `url(chrome://dot/content/skin/icons/${icon}.svg)`,
                    fill: colour || ""
                }}
            ></i>

            <div className={"ui-popup-dialog-item-titles"} style={{ color: colour || "" }}>
                <h1 className={"ui-popup-dialog-item-title"}>
                    {title}
                </h1>

                {subtitle && <span className={"ui-popup-dialog-item-subtitle"}>
                    {subtitle}
                </span>}
            </div>
        </a>
    )
}