import React, { FC } from "react";

export const Card: FC<{ title: string }> = ({
    title,
    children
}) => (
    <div className="web-ui-card-container">
        <h3>{title}</h3>
        <div className="card">{children}</div>
    </div>
);
