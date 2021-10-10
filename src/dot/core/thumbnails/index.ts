import { Tab } from "../../models/Tab";

export class ThumbnailManager {
    public tab: Tab;

    public async 300() {
        return await this.capture(300, 200);
    }

    public async 600() {
        return await this.capture(600, 400);
    }

    public async 1200() {
        return await this.capture(1200, 800);
    }

    public async 1920() {
        return await this.capture(1920, 1080);
    }

    public constructor(tab: Tab) {
        this.tab = tab;
    }

    public async capture(width: number, height: number) {
        const args = {
            fullScale: false,
            isImage: false,
            backgroundColor: "#FFFFFF",
            targetWidth: width
        };

        if (this.tab.webContents.isRemoteBrowser) {
            if (
                !this.tab.webContents.browsingContext ||
                !this.tab.webContents.parentElement
            ) {
                return null;
            }

            const actor =
                this.tab.webContents.browsingContext.currentWindowGlobal.getActor(
                    "Thumbnails"
                );

            const metadata = await actor.sendQuery(
                "Browser:Thumbnail:ContentInfo",
                args
            );

            if (!metadata.width || !metadata.height)
                throw new Error("IMAGE_ZERO_DIMENSION");

            const canvas = document.createElementNS(
                "http://www.w3.org/1999/xhtml",
                "canvas"
            ) as HTMLCanvasElement;

            let image: any;

            if (metadata.imageData) {
                canvas.width = metadata.width;
                canvas.height = metadata.height;

                image = new Image();
                await new Promise((resolve) => {
                    image.onload = resolve;
                    image.src = metadata.imageData;
                });
            } else {
                const scale = Math.min(
                    Math.max(
                        width / metadata.width,
                        height / metadata.height
                    ),
                    1
                );

                image =
                    await this.tab.webContents.drawSnapshot(
                        0,
                        0,
                        metadata.width,
                        metadata.height,
                        scale,
                        args.backgroundColor
                    );

                canvas.width = width;
                canvas.height = height;
            }

            canvas
                .getContext("2d")
                ?.drawImage(image, 0, 0);

            return canvas;
        } else {
            return null;
        }
    }
}
