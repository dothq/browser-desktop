export const sleep = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), ms);
    });
};
