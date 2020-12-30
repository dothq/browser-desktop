import execa from "execa"
import { log } from ".."
import { BUILD_TARGETS } from "../constants"

export const build = async (os: string) => {
    if(!BUILD_TARGETS.includes(os)) return log.error(`Unrecognised build target "${os}".\nWe only currently support ${JSON.stringify(BUILD_TARGETS)}.`)

    log.info(`Building Dockerfile for "${os}"...`)
    
    const proc = execa("docker", ["build", "build", "-f", `build/${os}.dockerfile`], { cwd: process.cwd() });

    (proc.stdout as any).on('data', (data: any) => {
        const d = data.toString();

        d.split("\n").forEach((line: any) => {
            if(line.length !== 0) log.info(line)
        });
    });
}