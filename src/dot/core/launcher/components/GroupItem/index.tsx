import React from "react";

export const GroupItem = ({
    title,
    subtitle,
    icon,
    id,
    active,
    onMouseEnter
}: {
    title: string;
    subtitle?: string;
    icon: any;
    id?: any;
    active?: boolean;
    onMouseEnter?: any;
}) => {
    return (
        <a
            id={id}
            className={"launcher-result-group-item"}
            onMouseEnter={onMouseEnter}
            data-active={active}
        >
            <i
                className={
                    "launcher-result-group-item-icon"
                }
                style={{
                    backgroundImage: `url(${icon})`
                }}
            />

            <div
                className={
                    "launcher-result-group-item-text"
                }
            >
                <span className={"groupitem-text-title"}>
                    {title}
                </span>

                {subtitle && (
                    <span
                        className={
                            "groupitem-text-subtitle"
                        }
                    >
                        {subtitle}
                    </span>
                )}
            </div>
        </a>
    );
};
