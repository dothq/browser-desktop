import { ToolbarButton } from "../ToolbarButton"

export const BrowserTab = ({ active }: { active?: boolean }) => {
    return (
        <div className={"tabbrowser-tab"} attr:active={active}>
            <div className={"tab-background"}></div>

            <div className={"tab-content"}>
                <i className={"tab-icon-stack"}>

                </i>

                <span className={"tab-label-container"}>
                    <label className={"tab-text tab-label"}>New Tab</label>
                </span>

                <ToolbarButton
                    className={"tab-close-button close-icon"}
                    image={"chrome://dot/content/skin/icons/close.svg"}
                />
            </div>
        </div>
    )
}