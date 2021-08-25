import { SearchFilter } from "..";
import { dot } from "../../../api";
import { NetUtil } from "../../../modules";
import { SearchSuggestion } from "../suggestion";
import { substituteSearchUrl } from "../utils/substitution";

export class EngineSearchProvider {
    public name = "Search Engine"
    public description = "Search the web using your default search engine."
    public icon = "chrome://dot/content/skin/icons/search.svg"

    public enabled() {
        return dot.prefs.get("dot.search.provider.engine.enabled", true);
    }

    public get currentSearchEngine() {
        return {
            name: "DuckDuckGo",
            description: "Search DuckDuckGo",
            manifest_version: 2,
            version: "1.1",
            applications: {
                gecko: {
                    id: "ddg@search.dothq.co"
                }
            },
            hidden: true,
            icons: {
                16: "favicon.ico"
            },
            web_accessible_resources: [
                "favicon.ico"
            ],
            chrome_settings_overrides: {
                search_provider: {
                    keyword: [
                        "@duckduckgo",
                        "@ddg"
                    ],
                    name: "DuckDuckGo",
                    search_url: "https://duckduckgo.com/",
                    search_form: "https://duckduckgo.com/?q={searchTerms}",
                    search_url_get_params: "q={searchTerms}",
                    params: [],
                    suggest_url: "https://ac.duckduckgo.com/ac/",
                    suggest_url_get_params: "q={searchTerms}&type=list"
                }
            }
        }
    }

    constructor() {

    }

    public constructSuggestUrl(query: string) {
        const { chrome_settings_overrides } = this.currentSearchEngine;
        const provider = chrome_settings_overrides.search_provider;

        const getParams = provider.suggest_url_get_params.startsWith("?")
            ? provider.suggest_url_get_params
            : `?${provider.suggest_url_get_params}`

        const url = `${provider.suggest_url}${getParams}`;

        return substituteSearchUrl({ url, query, engine: this.currentSearchEngine });
    }

    public constructSearchUrl(query: string) {
        const { chrome_settings_overrides } = this.currentSearchEngine;
        const provider = chrome_settings_overrides.search_provider;

        const getParams = provider.search_url_get_params.startsWith("?")
            ? provider.search_url_get_params
            : `?${provider.search_url_get_params}`

        const url = `${provider.search_url}${getParams}`;

        return substituteSearchUrl({ url, query, engine: this.currentSearchEngine });
    }

    public async suggest(filter: SearchFilter): Promise<SearchSuggestion[]> {
        const suggestUrl = this.constructSuggestUrl(filter.term);

        const pinkyPromisedFetch = (): Promise<string[]> => new Promise((resolve) => {
            NetUtil.asyncFetch({
                uri: suggestUrl,
                loadUsingSystemPrincipal: true
            }, (inputStream: any, status: any) => {
                try {
                    const data = NetUtil.readInputStreamToString(
                        inputStream,
                        inputStream.available(),
                        { charset: "utf-8" }
                    );

                    const json = JSON.parse(data);

                    resolve(json[1] || []);
                } catch (e) {
                    console.log("Failed to load search suggestions.", e);
                    resolve([]);
                }
            });
        });

        const results = await pinkyPromisedFetch();

        return (results.map(r => {
            return new SearchSuggestion({
                title: r,
                icon: this.icon,
                url: this.constructSearchUrl(r)
            })
        }) as SearchSuggestion[])
    }
}