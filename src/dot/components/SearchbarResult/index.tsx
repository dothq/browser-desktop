import React from "react";
import { SearchSuggestion } from "../../core/search/suggestion";

export const SearchbarResult = ({
    title,
    subtitle,
    icon,
    active
}: Partial<SearchSuggestion> & { active: boolean }) => {
    const isSearch =
        icon ==
        "chrome://dot/content/skin/icons/search.svg";

    return (
        <a
            className={"urlbar-result"}
            data-active={active}
        >
            <i
                className={"urlbar-result-icon"}
                style={{
                    backgroundImage: `url(${icon})`,
                    backgroundSize: isSearch ? 12 : 16
                }}
            ></i>

            <div className={"urlbar-result-title-group"}>
                <h1 className={"urlbar-result-title"}>
                    {title}
                </h1>
                {subtitle && (
                    <span
                        className={
                            "urlbar-result-subtitle"
                        }
                    >
                        {subtitle}
                    </span>
                )}
            </div>
        </a>
    );
};
