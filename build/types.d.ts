export interface Cmd {
    cmd: string;
    description: string;

    controller: (...args: any) => void;

    options?: CmdOption[];
    aliases?: string[];
    flags?: {
        platforms?: CmdFlagPlatform[];
    };
}

export interface CmdOption {
    arg: string;
    description: string;
}

export type CmdFlagPlatform = NodeJS.Platform;
