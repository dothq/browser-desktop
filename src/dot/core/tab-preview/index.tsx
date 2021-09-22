import React from "react";
import { TransitionStatus } from "react-transition-group";
import { Tab } from "../../models/Tab";

const animation: Partial<Record<TransitionStatus, any>> = {
    entering: {
        opacity: 0
    },
    entered: {
        opacity: 1
    }
}

export const TabPreview = ({ tab, stage, x }: { tab: Tab | undefined, stage: TransitionStatus, x: number }) => {
    const [host, setHost] = React.useState(tab?.url);

    React.useEffect(() => {
        try {
            setHost(tab?.urlParsed.host)
        } catch (e) { }
    }, [])

    return (
        <menu
            className={"tabbrowser-tab-preview"}
            style={{
                transform: `translateX(${x}px)`,
                ...animation[stage]
            }}
        >
            <div className={"menu-background"}></div>

            <div className={"tabbrowser-tab-preview-container"}>
                <span className={"page-title"}>
                    {tab?.title}
                </span>

                <span className={"page-host"}>
                    {host}
                </span>
            </div>
        </menu>
    )
}