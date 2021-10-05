import { dot } from "../../../api";

const PARAM_REGEXP = /\{((?:\w+:)?\w+)(\??)\}/g;

export const substituteSearchUrl = ({
    url,
    query,
    engine
}: {
    url: string;
    query: string;
    engine: any;
}) => {
    return url.replace(
        PARAM_REGEXP,
        (match, variable, optional) => {
            if (variable == "searchTerms") return query;
            if (variable == "inputEncoding")
                return engine.queryCharset || "UTF-8";
            if (variable == "outputEncoding")
                return "UTF-8";

            if (
                (engine.isAppProvided &&
                    variable == "moz:locale") ||
                variable == "language"
            )
                return dot.utilities.browserLanguage;

            if (
                variable.startsWith("moz:") &&
                engine.isAppProvided
            ) {
                if (variable == "moz:date") {
                    const d = new Date();

                    const pad = (num: number) =>
                        num.toString().padStart(2, "0");

                    return [
                        String(d.getFullYear()),
                        pad(d.getMonth() + 1),
                        pad(d.getDate()),
                        pad(d.getHours())
                    ].join("");
                }

                if (
                    variable == "moz:distributionID" ||
                    variable == "moz:official"
                )
                    return "";
            }

            if (optional) return "";

            // Unsupported params
            if (variable == "count") return 20;
            if (variable == "startIndex") return 1;
            if (variable == "startPage") return 1;

            return match;
        }
    );
};
