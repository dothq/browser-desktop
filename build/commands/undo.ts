import { Melon } from "..";
import { lightError, yesno } from "../utils/log";
import { engineDir } from "../utils/path";
import { $$ } from "../utils/sh";
import { ExportCommand } from "./export";

export class UndoCommand {
    public name = "undo [commit]";
    public description = "Undo a patch.";

    public aliases = [
        "u"
    ]

    public async exec(cli: Melon, commit: string) {
        const { data } = await $$({ cwd: engineDir, shutUp: true })`${[
            "git",
            "--no-pager",
            "log",
            "--format=\"%H %s\"",
            "-n",
            "1",
        ].concat(commit ? [commit] : []).join(" ")}`;

        const [rev, ...rest] = data.split(" ");
        const msg = rest.join(" ");

        if(msg.toLowerCase() == "initial commit") return lightError("Can't go any deeper than the first revision.")

        const answer = await yesno(`Are you sure you want to undo "${msg}"?`);;
        if(!answer) process.exit(0);

        await $$({ cwd: engineDir })`git reset --soft ${`${rev}~1`}`;

        return await (new ExportCommand()).exec(cli);
    }
}