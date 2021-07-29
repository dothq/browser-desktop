declare global {
    interface Window { 
        AppConstants: {
            [key: string]: string
        },

        Services: {
            [key: string]: string
        },

        ChromeUtils: {
            import(moduleUri: string): any
            generateQI(contractIds: string[]): any
            defineModuleGetter(
                owner: any,
                module: string,
                moduleUri: string
            ): any
        },

        mozInnerScreenX: number
        mozInnerScreenY: number

        maximize(): void,
        restore(): void,
        minimize(): void
    }
}

export const exportPublic = (name: string, data: any) => {
    (window as any)[name] = data;
}