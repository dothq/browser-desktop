import React from "react";

export class Clock extends React.Component {
    public state = {
        hh: new Date().getHours().toString().padStart(2, "0"),
        mm: new Date().getMinutes().toString().padStart(2, "0"),
        ss: new Date().getSeconds().toString().padStart(2, "0")
    }

    public maybeProcessTick() {
        const date = new Date();

        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");

        this.setState({
            hh: hours,
            mm: minutes,
            ss: seconds
        });
    }

    public constructor(props: any) {
        super(props);

        this.maybeProcessTick = this.maybeProcessTick.bind(this);
    }

    public componentDidMount() {
        setInterval(this.maybeProcessTick, 1000);
    }

    public render() {
        return (
            <time className={"widget-clock tl"}>
                {this.state.hh}:{this.state.mm}
            </time>
        )
    }
}