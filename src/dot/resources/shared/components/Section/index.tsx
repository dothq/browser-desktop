import React from "react"
import { ToolbarButton } from "../../../../components/ToolbarButton"

export const Section = ({ title, children, breadcrumbs }: { title: string; children?: any, breadcrumbs?: string[] }) => {
    return (
        <section className={"webui-section"}>
            <h1 className={"webui-section-title"}>
                {breadcrumbs && <ToolbarButton image={"chrome://dot/content/skin/icons/back.svg"} />}
                {title}
                {breadcrumbs?.join(" / ")}
            </h1>

            {children}
        </section>
    )
}