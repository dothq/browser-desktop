export const EMOJI_REGEX =
    /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;

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

export const URL_WITH_PROTO_REGEX =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
export const URL_NAKED_REGEX =
    /^(?:(?:(?:[a-zA-z\-]+)\:\/{1,3})?(?:[a-zA-Z0-9])(?:[a-zA-Z0-9\-\.]){1,61}(?:\.[a-zA-Z]{2,})+|\[(?:(?:(?:[a-fA-F0-9]){1,4})(?::(?:[a-fA-F0-9]){1,4}){7}|::1|::)\]|(?:(?:[0-9]{1,3})(?:\.[0-9]{1,3}){3})|localhost)(?:\:[0-9]{1,5})?$/;
export const URL_CHROME_PATH_REGEX =
    /\/[a-zA-Z0-9]*\/content/;
