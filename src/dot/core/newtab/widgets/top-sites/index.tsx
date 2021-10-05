import React from "react";

const mockTopSites = [
    {
        id: "github",
        title: "GitHub",
        url: "https://github.com"
    },
    {
        id: "twitter",
        title: "Twitter",
        url: "https://twitter.com"
    },
    {
        id: "dothq",
        title: "Dot HQ",
        url: "https://www.dothq.co"
    },
    {
        id: "reddit",
        title: "Reddit",
        url: "https://reddit.com"
    },
    {
        id: "figma",
        title: "Figma",
        url: "https://figma.com"
    },
    {
        id: "site",
        title: "Site",
        url: "https://example.com"
    }
];

export class TopSites extends React.Component {
    public componentDidMount() {
        // We aren't in Dot Browser
        if (typeof (window as any).dot == "undefined") {
        } else {
            const win: any = window;

            // todo
            win.dot.topSites;
        }
    }

    public render() {
        return (
            <div className={"widget-topsites bm"}>
                {mockTopSites.map((site) => (
                    <a
                        className={"widget-topsite"}
                        target={"_blank"}
                        href={site.url}
                        key={site.id}
                    >
                        <i
                            className={
                                "widget-topsite-icon"
                            }
                            style={
                                {
                                    "--topsite-icon": `url(page-icon:${site.url})`
                                } as any
                            }
                        ></i>

                        <span
                            className={
                                "widget-topsite-title"
                            }
                        >
                            {site.title}
                        </span>
                    </a>
                ))}
            </div>
        );
    }
}
