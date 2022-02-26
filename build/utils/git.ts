import fs from "fs";
import git from "isomorphic-git";

export const setConfig = (dir: string, key: string, value: any) => {
    return git.setConfig({ 
        fs, 
        dir,
        path: key,
        value
    });
}