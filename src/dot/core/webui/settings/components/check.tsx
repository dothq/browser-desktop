import React, { FC } from "react";

export const CheckIcon: FC<{
    className?: string;
    size: number;
    strokeWidth?: number;
}> = ({ className, size, strokeWidth }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={strokeWidth || 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);
