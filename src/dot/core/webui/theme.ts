window.dot = window.windowRoot.ownerGlobal.dot;

(async () => {
    const dot = window.dot;

    const { currentThemeId } = dot.theme;

    const variables: Record<string, string> =
        dot.theme.makeThemeVariables(currentThemeId);

    for (const [key, value] of Object.entries(
        variables
    )) {
        document.documentElement.style.setProperty(
            key,
            value
        );
    }
})();
