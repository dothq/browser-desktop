import { Cc, Ci, OS } from "../../modules";

export const loader = async (
    root: string,
    lang: string
): Promise<string> => {
    const l10nDir = Cc[
        "@mozilla.org/file/local;1"
    ].createInstance(Ci.nsIFile);
    if (l10nDir)
        l10nDir.initWithPath(OS.Path.join(root, lang));

    let ftl: string[] = [];

    const l10nCrawler = async (
        directory: any,
        originalDir: string
    ) => {
        for await (const item of directory.directoryEntries) {
            if (item.isDirectory()) {
                l10nCrawler(item, originalDir);
            } else if (
                item.path.startsWith(originalDir) &&
                item.path.endsWith(".ftl")
            ) {
                ftl.push(item.path);
            }
        }
    };

    await l10nCrawler(l10nDir, root);

    ftl = ftl.map((i) => {
        return `chrome://dot/content/l10n${i.replace(
            root,
            ""
        )}`;
    });

    let data: string = "";

    for await (const uri of ftl) {
        const res = await fetch(uri);
        const raw = await res.text();

        data += `${raw}\n`;
    }

    return data;
};
