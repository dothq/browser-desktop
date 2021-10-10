import { SearchFilter } from "..";
import { dot } from "../../../api";
import { NetUtil } from "../../../modules";
import { SearchSuggestion } from "../suggestion";

export class WikipediaSearchProvider {
    public name = "Wikipedia";
    public description =
        "Search Wikipedia to find articles on your search.";
    public icon =
        "chrome://dot/content/skin/icons/search/wikipedia.svg";

    public enabled() {
        return dot.prefs.get(
            "dot.search.provider.wikipedia.enabled",
            true
        );
    }

    constructor() {}

    public constructSuggestUrl(query: string) {
        const lang =
            dot.utilities.browserLanguage.split("-")[0] ||
            "en";

        const root = `https://${lang}.wikipedia.org/w/api.php`;
        const queryParams = `?action=opensearch&search=${query}&limit=1&profile=strict`;

        return root + queryParams;
    }

    public async suggest(
        filter: SearchFilter
    ): Promise<SearchSuggestion[]> {
        const suggestUrl = this.constructSuggestUrl(
            filter.term
        );

        const pinkyPromisedFetch = (
            uri: string
        ): Promise<any> =>
            new Promise((resolve) => {
                NetUtil.asyncFetch(
                    {
                        uri,
                        loadUsingSystemPrincipal: true
                    },
                    (inputStream: any, status: any) => {
                        try {
                            const data =
                                NetUtil.readInputStreamToString(
                                    inputStream,
                                    inputStream.available(),
                                    { charset: "utf-8" }
                                );

                            const json = JSON.parse(data);

                            resolve(json);
                        } catch (e) {
                            console.log(
                                "Failed to load search suggestions.",
                                e
                            );
                            resolve({});
                        }
                    }
                );
            });

        const article = await pinkyPromisedFetch(
            suggestUrl
        );

        if (!article) return [];

        const lang =
            dot.utilities.browserLanguage.split("-")[0] ||
            "en";
        const y = new Date().getFullYear();
        const m = new Date().getMonth();
        const viewsRoot = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${lang}.wikipedia`;
        const viewsPath = `/all-access/all-agents/${
            article[1][0]
        }/monthly/${y}${m
            .toString()
            .padStart(2, "0")}01/${y}${(m + 1)
            .toString()
            .padStart(2, "0")}01`;

        const views = await pinkyPromisedFetch(
            `${viewsRoot}${viewsPath}`
        );

        if (views && views.items) {
            const totalViews = views.items[0].views;

            console.log(article[1][0], totalViews);

            // We only want to return results for articles with more than 50,000 views.
            if (totalViews >= 50000)
                return [
                    new SearchSuggestion({
                        title: article[1][0],
                        icon: this.icon
                    })
                ];
            else return [];
        } else {
            return [];
        }
    }
}
