import React from "react";
import { MozURI } from "../../../types/uri";

interface Props {
    title: string;
    favicon?: string;
    pendingIcon: boolean;
    ready: boolean;
    url: MozURI;
}

export const TabContent = ({ title, favicon, ready, url, pendingIcon }: Props) => {
    return (
        <div 
            className={"tab-content"}
        >
            <i 
                className={`tab-favicon ${ready
                    ? (favicon && favicon.length) || pendingIcon
                        ? ""
                        : "hidden"
                    : "loading"}`}
                style={{
                    backgroundImage: ready && favicon && favicon.length
                        ? `url(${favicon})`
                        : ``
                }}
            />

            <span style={{ position: "fixed", top: "53px", left: "53px", backgroundColor: "red", zIndex: 56754674567567456745674567546745674567 }}>
                {ready
                    ? !!(favicon && favicon.length) || pendingIcon
                        ? ""
                        : "hidden"
                    : "loading"}
                {`fv: ${!!(favicon && favicon.length)}`}
                {`pfv: ${pendingIcon}`}
            </span>

            <span className={"tab-title"}>
                {title}
            </span>
        </div>
    )
}