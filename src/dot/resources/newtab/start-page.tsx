import React from "react";
import ReactDOM from "react-dom";
import { backgrounds } from "./backgrounds";
import { Attribution } from "./widgets/attribution";
import { Clock } from "./widgets/clock";
import { Search } from "./widgets/search";
import { TopSites } from "./widgets/top-sites";

interface Background {
    id: string,
    author: {
        name: string,
        url: string
    }
}

class StartPage extends React.Component {
    public state = {
        background: {} as Background
    }

    public maybeLoadImage(background: string, resolution: number) {
        const chromeURI = `chrome://dot/content/resources/newtab/backgrounds`;

        return new Promise((resolve) => {
            const image = new Image();
            image.src = `${chromeURI}/${background}/${resolution}.jpg`;

            document.documentElement.style.setProperty(
                "--start-page-image",
                `url(${image.src})`
            )

            image.onload = () => {
                resolve(true);
            }
        })
    }

    public async componentDidMount() {
        const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];

        await this.maybeLoadImage(background.id, 1080);

        document.documentElement.style.setProperty("--start-page-opacity", "1");
        document.documentElement.style.setProperty("--start-page-transform", "scale(1)");

        this.setState({
            ...this.state,
            background
        })
    }

    public render() {
        return (
            <>
                <Clock />
                <Attribution author={this.state.background.author} />
                <Search />
                <TopSites />
            </>
        )
    }
}

ReactDOM.render(
    <StartPage />,
    document.getElementById("start-page")
)