import { resolve } from "path";
import { dispatch } from "../utils";

export const test = async () => {
    dispatch(
        "yarn",
        ["test"],
        resolve(process.cwd(), "src", "dot")
    );
};
