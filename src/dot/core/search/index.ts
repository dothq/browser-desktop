import {
    URL_CHROME_PATH_REGEX,
    URL_NAKED_REGEX,
    URL_WITH_PROTO_REGEX
} from "../../shared/regex";
import { CalculatorSearchProvider } from "./providers/calculator";
import { EngineSearchProvider } from "./providers/engine";
import { WikipediaSearchProvider } from "./providers/wikipedia";
import { SearchSuggestion } from "./suggestion";
import { removeDuplicateKV } from "./utils/remove-dupes";
import { substituteSearchUrl } from "./utils/substitution";

export interface SearchFilter {
    term: string;
}

export class Search {
    // The order of these providers is important!
    // Item [0] would be first in the results
    // and the last item would be last in the results
    public providers = {
        calculator: new CalculatorSearchProvider(),
        engine: new EngineSearchProvider(),
        wikipedia: new WikipediaSearchProvider()
    };

    public registeredSchemes = [
        "chrome",
        "file",
        "resource"
    ];

    public async suggest(filter: SearchFilter) {
        if (!filter.term.length) return [];

        let results: SearchSuggestion[] | any[] = [];

        let url: string = filter.term;

        const flags = {
            isNaked: !!filter.term.match(URL_NAKED_REGEX)
        };

        const suggestion = {
            type: "search",
            url: "",
            urlFlags: {
                isChrome: false
            }
        };

        // We need to add a protocol to the domain name
        if (flags.isNaked) {
            // @todo we should upgrade this to https
            url = `http://${url}`;
            suggestion.type = "url";
        }

        // We can now try our stricter URL regex on our query
        // If it still matches we can start to perform the
        // advanced URL parsing.
        if (url.match(URL_WITH_PROTO_REGEX)) {
            suggestion.type = "url";

            const protocol = url.split(":")[0];
            const path = `/${url.substring(
                url.indexOf("/") + 1
            )}`;

            if (protocol == "chrome") {
                suggestion.type = "url";

                // We only want to match chrome: urls as valid if
                // the path follows a typical chrome path
                // For example:
                //     matches: chrome://browser/content
                //     doesn't: chrome://test
                if (path.match(URL_CHROME_PATH_REGEX)) {
                    suggestion.urlFlags.isChrome = true;
                } else {
                    suggestion.type = "search";
                    suggestion.urlFlags.isChrome = false;
                }
            }
        }

        const engine =
            this.providers.engine.currentSearchEngine;

        if (suggestion.type == "search") {
            const provider =
                engine.chrome_settings_overrides
                    .search_provider;

            const getParams =
                provider.search_url_get_params.startsWith(
                    "?"
                )
                    ? provider.search_url_get_params
                    : `?${provider.search_url_get_params}`;

            suggestion.url = substituteSearchUrl({
                url: `${provider.search_url}${getParams}`,
                query: filter.term,
                engine
            });

            results.push(
                new SearchSuggestion({
                    title: filter.term,
                    url: suggestion.url,
                    icon: `chrome://dot/content/skin/icons/search.svg`
                })
            );
        } else if (suggestion.type == "url") {
            suggestion.url = url;

            results.push(
                new SearchSuggestion({
                    title: filter.term,
                    url: suggestion.url,
                    icon: `page-icon:${url}`
                })
            );

            results.push(
                // We want to give the user the option to search a URL
                // using their search engine instead of going to the page
                new SearchSuggestion({
                    title: filter.term,
                    titleSuffix: engine.name,
                    icon: `chrome://dot/content/skin/icons/search.svg`
                })
            );
        }

        for await (const [
            name,
            provider
        ] of Object.entries(this.providers)) {
            const providerResults =
                await provider.suggest(filter);

            results = results.concat(providerResults);
        }

        results = removeDuplicateKV(results, "title");

        return results;
    }
}
