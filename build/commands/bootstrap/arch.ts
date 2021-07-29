import execa from "execa";

export async function pacmanInstall(
    ...packages: string[]
): Promise<string> {
    return (
        await execa("sudo", [
            "pacman",
            "--noconfirm",
            "-S",
            ...packages
        ])
    ).stdout;
}
