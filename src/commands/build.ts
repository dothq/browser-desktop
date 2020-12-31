import execa from "execa"
import { resolve } from "path"
import { log } from ".."
import { BUILD_TARGETS } from "../constants"
import { dispatch } from "../dispatch"

export const build = async (os: string) => {
    if(!BUILD_TARGETS.includes(os)) return log.error(`Unrecognised build target "${os}".\nWe only currently support ${JSON.stringify(BUILD_TARGETS)}.`)

    const dockerfile = `build/${os}.dockerfile`
    const image_name = `db-${os}-build`

    log.info(`Building Dockerfile for "${os}"...`)
    await dispatch("docker", ["build", "build", "-f", dockerfile, "-t", image_name])

    log.info(`Starting browser build for "${os}"...`)
    await dispatch("docker", ["run", "-it", "-v", `${resolve(process.cwd(), "firefox")}:/worker/build`, image_name])
}