export const BrowserUIUtils = {
    checkEmptyPageOrigin: (browser: any, uri = browser.currentURI) => {
        if (browser.hasContentOpener) return false;

        const { contentPrincipal } = browser;

        const uriToCheck = browser.documentURI || uri;

        if (
            (
                uriToCheck.spec == "about:blank" &&
                contentPrincipal.isNullPrincipal
            ) ||
            contentPrincipal.spec == "about:blank"
        ) {
            return true;
        }

        if (contentPrincipal.isContentPrincipal) return contentPrincipal.equalsURI(uri);

        return contentPrincipal.isSystemPrincipal;
    },
}