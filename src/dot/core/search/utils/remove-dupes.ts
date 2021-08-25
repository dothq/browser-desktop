export const removeDuplicateKV = (array: Array<any>, key: string) => {
    const filterArr: any[] = [];
    const newArr: any[] = [];

    for (const i of array) {
        if (!filterArr.includes(i[key])) {
            filterArr.push(i[key]);
            newArr.push(i);
        }
    }

    return newArr;
}