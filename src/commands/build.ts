import execa from "execa"
import { resolve } from "path"
import { log } from ".."
import { BUILD_TARGETS } from "../constants"
import { dispatch } from "../dispatch"
import Docker from 'dockerode';

export const build = async (os: string) => {
    if(!BUILD_TARGETS.includes(os)) return log.error(`Unrecognised build target "${os}".\nWe only currently support ${JSON.stringify(BUILD_TARGETS)}.`)

    const dockerfile = `build/${os}.dockerfile`
    const image_name = `db-${os}-build`

    log.info(`Building Dockerfile for "${os}"...`)
    await dispatch("docker", ["build", "build", "-f", dockerfile, "-t", image_name])

    const docker = new Docker();

    const container = await docker.createContainer({ 
        Image: image_name,
        Tty: true,
        Volumes: {
            "/worker/build": {}
        },
        HostConfig: {
            Binds: [`${resolve(process.cwd(), "firefox")}:/worker/build`],
        }
    });

    container.attach({ stream: true, stdin: true, stdout: true, stderr: true }, (e, out) => {
        if(out) out.pipe(process.stdout);
    })

    await container.start()
}