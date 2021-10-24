module.exports = function(source) {
    this.cacheable();
    return `
@mixin useReducedMotion {
    #browser.ui-reduce-motion {
        @content;
    }

    @media (prefers-reduced-motion: reduce) {
        @content;
    }
}

${source}
`;
}