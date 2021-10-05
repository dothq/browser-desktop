import { evaluate } from "mathjs";
import { SearchFilter } from "..";
import { dot } from "../../../api";
import { SearchSuggestion } from "../suggestion";

export class CalculatorSearchProvider {
    public name = "Calculator";
    public description =
        "Perform anything from basic operations to complex equations right from your searchbar.";
    public icon =
        "chrome://dot/content/skin/icons/calculator.svg";

    public enabled() {
        return dot.prefs.get(
            "dot.search.provider.calculator.enabled",
            true
        );
    }

    constructor() {}

    public async suggest(
        filter: SearchFilter
    ): Promise<SearchSuggestion[]> {
        return new Promise((resolve) => {
            try {
                const result = evaluate(filter.term);

                let evaluated;

                switch (result.constructor.name) {
                    case "ResultSet":
                        evaluated = result.entries.join();
                        break;
                    default:
                        evaluated = result.toString();
                        break;
                }

                const suggestion = new SearchSuggestion({
                    title: filter.term,
                    subtitle: evaluated,
                    icon: this.icon
                });

                resolve(
                    evaluated.length ? [suggestion] : []
                );
            } catch (e) {
                resolve([]);
            }
        });
    }
}
