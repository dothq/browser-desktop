import React, { FC } from "react";

export const ColorSelector: FC<{ defaultColour: string }> = ({ defaultColour }) => {
    const [selectedColor, setSelectedColor] = React.useState(defaultColour);

    return (
        <div className="colour-selector-component">
            {window.dot.theme.accentColours.map(colour => (
                <div
                    className={`colour-circle accent-colour-${colour}`}
                    key={colour}
                    style={{ backgroundColor: window.dot.theme.accentHexes[colour] || 'red' }}
                    onClick={() => {
                        window.dot.theme.updateAccentColour(colour);
                        setSelectedColor(colour);
                    }}
                >
                    <div className="inset" style={{ display: selectedColor === colour ? 'block' : 'none' }}></div>
                </div>
            ))}
        </div>
    )
}