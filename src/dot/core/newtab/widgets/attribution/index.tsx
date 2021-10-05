import React from "react";

interface Props {
    author: {
        name: string;
        url: string;
    };
}

export class Attribution extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
    }

    public render() {
        if (!this.props.author) return <></>;

        return (
            <span className={"widget-attribution bl"}>
                Image courtesy of&nbsp;
                <a
                    target={"_blank"}
                    href={this.props.author.url}
                >
                    {this.props.author.name}
                </a>
            </span>
        );
    }
}
