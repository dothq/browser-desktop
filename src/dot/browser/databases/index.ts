import dot from "index";
import {
    Ci,
    IOUtils,
    OS,
    PathUtils,
    Services,
    Sqlite
} from "mozilla";

class BrowserDatabase {
    public name: string;
    public path: string;
    public ready: boolean = false;

    public connection: any;

    public async openConnection() {
        return new Promise(async (resolve) => {
            let connection = null;
            let retryCount = 0;

            try {
                const dbStorePath = PathUtils.join(
                    await PathUtils.getProfileDir(),
                    "dbstore"
                );

                IOUtils.makeDirectory(dbStorePath);

                await OS.File.writeAtomic(
                    this.path,
                    new Uint8Array(),
                    {}
                );
            } catch (e) {
                console.warn(e);
            }

            while (!connection && retryCount++ < 25) {
                try {
                    connection =
                        await Sqlite.openConnection({
                            path: this.path
                        });

                    this.ready = true;
                } catch (e) {
                    await dot.utilities.sleep(100);
                }
            }

            if (!connection) {
                window.dump(
                    `*** Failed to establish connection to ${this.path}. ***`
                );

                return Services.startup.quit(
                    Ci.nsIAppStartup.eForceQuit
                );
            }

            this.connection = connection;
            resolve(connection);
        });
    }

    public constructor(name: string) {
        this.name = name;

        this.path = OS.Path.join(
            OS.Constants.Path.profileDir,
            `dbstore/${name}.sqlite`
        );
    }
}

export default BrowserDatabase;
