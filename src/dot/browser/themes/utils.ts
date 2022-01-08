export function isColourDark(
    r: number,
    g: number,
    b: number
) {
    return 0.2125 * r + 0.7154 * g + 0.0721 * b <= 110;
}

export const hexToRGB = (hex: string) => {
    if (hex.length !== 6) return [255, 255, 255];

    const parts = hex.match(/.{1,2}/g);

    if (!parts) return [255, 255, 255];

    return [
        parseInt(parts[0], 16),
        parseInt(parts[1], 16),
        parseInt(parts[2], 16)
    ];
};

export const hslToRGB = (
    h: number,
    s: number,
    l: number
) => {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (
            p: number,
            q: number,
            t: number
        ) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
};

export const toRGB = (colour: string): number[] => {
    let type: "hex" | "hsl" | "rgb" | undefined;

    if (colour.startsWith("#")) type = "hex";
    else if (colour.match(/0[xX][0-9a-fA-F]+/))
        type = "hex";
    else if (colour.startsWith("rgb")) type = "rgb";
    else if (colour.startsWith("hsl")) type = "hsl";
    else {
        return [255, 255, 255];
    }

    switch (type) {
        case "hex":
            return hexToRGB(colour.replace(/#/, ""));
        case "rgb":
            return colour
                .replace(/rgb\(/g, "")
                .replace(/\)/g, "")
                .split(",")
                .map((i) => parseInt(i));
        case "hsl":
            const hsl = colour
                .replace(/rgb\(/g, "")
                .replace(/\)/g, "")
                .split(",")
                .map((i) => parseInt(i));

            const h = hsl[0];
            const s = hsl[1];
            const l = hsl[2];

            return hslToRGB(h, s, l);
        default:
            return [255, 255, 255];
    }
};
