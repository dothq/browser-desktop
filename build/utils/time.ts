export const readableTime = (original: number) => {
    const diff = Date.now() - original;

    const s = Math.floor((diff / 1000) % 60);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const d = Math.floor(diff / (1000 * 60 * 60 * 60));

    const res = [];

    d >= 1 && res.push(`${d} day${d !== 1 ? "s" : ""}`);
    h >= 1 && res.push(`${h} hour${h !== 1 ? "s" : ""}`);
    m >= 1 &&
        res.push(`${m} minute${m !== 1 ? "s" : ""}`);
    res.push(`${s} second${s !== 1 ? "s" : ""}`);

    return new (Intl as any).ListFormat("en", {
        style: "long",
        type: "conjunction"
    }).format(res);
};
