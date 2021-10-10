import React, { FC } from "react";
import { CheckIcon } from "../check";

export const ImageSelector: FC<{
    values: {
        key: string;
        image: string;
        description: string;
    }[];
    onChange?: (key: string) => {};
    defaultKey: string;
}> = ({ children, values, onChange, defaultKey }) => {
    const [selected, setSelected] =
        React.useState<string>(defaultKey);

    function keyClick(key: string) {
        setSelected(key);

        if (onChange) {
            onChange(key);
        }
    }

    return (
        <div className="image-selector-container">
            {values.map((value) => (
                <div
                    onClick={() => {
                        keyClick(value.key);
                    }}
                    className="key"
                    key={value.key}
                >
                    <img
                        src={value.image}
                        alt={value.description}
                    />
                    <span
                        className="check"
                        style={{
                            display:
                                value.key === selected
                                    ? "flex"
                                    : "none"
                        }}
                    >
                        <CheckIcon
                            size={14}
                            strokeWidth={3}
                        />
                    </span>
                    <div className="description">
                        {value.description}
                    </div>
                </div>
            ))}

            {children}
        </div>
    );
};
