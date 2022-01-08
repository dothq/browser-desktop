import { exportPublic } from "./globals";

export const isBlankPageURL = (url: string) =>
    url == "about:blank" ||
    url == "about:home" ||
    url == "about:welcome";

exportPublic("isBlankPageURL", isBlankPageURL);
