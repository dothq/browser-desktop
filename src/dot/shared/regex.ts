export const EMOJI_REGEX = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;

export const COMMENT_REGEX = new RegExp(
    String.raw`
^
(
(?:
[^"\n] |
" (?:[^"\\\n] | \\.)* "
)*?
)

//.*
`.replace(/\s+/g, ""),
    "gm"
);