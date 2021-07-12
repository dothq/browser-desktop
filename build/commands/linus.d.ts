declare module "linus" {
    export function name(
        callback: (error: Error, name: string) => void
    ): void;
}
