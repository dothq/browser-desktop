import execa from 'execa';
import { resolve } from 'path';
import { confirm } from 'promptly';
import { bin_name, log } from '..';

export const reset = async () => {
    try {
        log.warning("This will clear all your unexported changes in the `src` directory!")
        log.warning(`You can export your changes by running |${bin_name} export|.`)
        confirm(`Are you sure you want to continue?`, { default: "false" }).then(async answer => {
            if(answer) {
                const cwd = resolve(process.cwd(), "src");

                await execa("git", ["checkout", "."], { cwd })

                log.success("Reset successfully.")
                log.info("Next time you build, it may need to recompile parts of the program because the cache was invalidated.")
            }
        }).catch(e => e)
    } catch(e) {}
}