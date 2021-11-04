import React from "react";
import {
    MenuItem,
    MenuPopupOptions
} from "../../models/Menu";

type Props = MenuPopupOptions & {
    template: MenuItem[];
    onMouseOver?: any;
    visible?: boolean;
    checkboxType?: "check" | "circle";
};

enum KeyboardDirection {
    Down,
    Up,
    Right,
    Left
}

export class ContextMenu extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
    }

    public submenuVisibleInt: any;

    public ref = React.createRef<HTMLMenuElement>();

    public state: any = {
        submenus: {},
        currentIndex: -1
    };

    public componentDidMount() {
        window.addEventListener("keypress", this);

        (
            document.getElementById("browser") as any
        ).inert = true;
        (
            document.getElementById(
                "browser-tabs-stack"
            ) as any
        ).inert = true;

        this.ref.current?.focus();
    }

    public componentWillUnmount() {
        window.removeEventListener("keypress", this);

        (
            document.getElementById("browser") as any
        ).inert = false;
        (
            document.getElementById(
                "browser-tabs-stack"
            ) as any
        ).inert = false;
    }

    public handleEvent(event: Event & KeyboardEvent) {
        switch (event.type) {
            case "keypress":
            // let direction = -1;

            // if(event.key == "ArrowDown") {
            //     direction = KeyboardDirection.Down;
            // } else if(event.key == "ArrowUp") {
            //     direction = KeyboardDirection.Up;
            // } else if(event.key == "ArrowRight") {
            //     direction = KeyboardDirection.Right;
            // } else if(event.key == "ArrowLeft") {
            //     direction = KeyboardDirection.Left;
            // }

            // console.log(direction)

            // const items: ChildNode[] = Array.from(this.ref.current?.childNodes as any);

            // const current = items[this.state.currentIndex] as HTMLElement | undefined;
            // const next = items[this.state.currentIndex + 1] as HTMLElement | undefined;
            // const prev = items[this.state.currentIndex - 1] as HTMLElement | undefined;

            // if(direction >= 0 && current) current?.removeAttribute("data-focused");

            // if(direction == KeyboardDirection.Down) {
            //     console.log("down", next, current);

            //     if(next) {
            //         next.setAttribute("data-focused", "true");
            //     }
            // } else if(direction == KeyboardDirection.Up) {
            //     console.log("up", prev, current);

            //     if(prev) {
            //         prev.setAttribute("data-focused", "true");
            //     }
            // }
        }
    }

    public render() {
        return (
            <menu
                role="menu"
                className="contextmenu"
                onMouseOver={this.props.onMouseOver}
                ref={this.ref}
                data-open={
                    "visible" in this.props
                        ? this.props.visible
                            ? true
                            : false
                        : true
                }
                style={
                    {
                        "--menu-x": `${this.props.x}px`,
                        "--menu-y": `${this.props.y}px`
                    } as any
                }
            >
                <div
                    className={"contextmenu-container"}
                    tabIndex={-1}
                >
                    {this.props.template.map((item) => {
                        if (!item) return;
                        if (!item.type)
                            item.type = "normal";

                        if (
                            (item.submenu &&
                                item.submenu.length) ||
                            (item.type == "radio" &&
                                item.submenu &&
                                item.submenu.find(
                                    (item) => item.checked
                                ))
                        ) {
                            const ref =
                                React.createRef<HTMLButtonElement>();

                            if (item.type == "radio") {
                                item.submenu =
                                    item.submenu.map(
                                        (i) => {
                                            if (!i.type)
                                                i.type =
                                                    "checkbox";
                                            i.click =
                                                item.click;

                                            return i;
                                        }
                                    );
                            }

                            const openMenu = () => {
                                const opener =
                                    ref.current as HTMLButtonElement;
                                if (!opener) return;
                                const bounds =
                                    opener.getBoundingClientRect();

                                this.setSubmenuVisibility(
                                    item.id,
                                    true,
                                    bounds.x +
                                        bounds.width -
                                        (this.props.x ||
                                            0),
                                    bounds.y -
                                        (this.props.y ||
                                            0)
                                );
                            };

                            const closeMenu = () =>
                                this.setSubmenuVisibility(
                                    item.id,
                                    false
                                );

                            return (
                                <button
                                    ref={ref}
                                    role={
                                        item.type ==
                                        "radio"
                                            ? "menuitemradio"
                                            : "menuitem"
                                    }
                                    aria-haspopup="menu"
                                    aria-expanded={
                                        this.state
                                            .submenus[
                                            item.id
                                        ] &&
                                        this.state
                                            .submenus[
                                            item.id
                                        ].visible
                                    }
                                    data-submenu={
                                        item.submenu &&
                                        item.submenu
                                            .length
                                    }
                                    tabIndex={0}
                                    onClick={() =>
                                        openMenu()
                                    }
                                    onKeyPress={(e) => {
                                        if (
                                            e.key ==
                                            "ArrowRight"
                                        )
                                            openMenu();
                                        else if (
                                            e.key ==
                                            "ArrowLeft"
                                        )
                                            closeMenu();
                                    }}
                                    onMouseOver={(e) => {
                                        clearTimeout(
                                            this
                                                .submenuVisibleInt
                                        );

                                        this.submenuVisibleInt =
                                            setTimeout(
                                                () =>
                                                    openMenu(),
                                                300
                                            );
                                    }}
                                    onMouseLeave={(e) => {
                                        clearTimeout(
                                            this
                                                .submenuVisibleInt
                                        );

                                        this.submenuVisibleInt =
                                            setTimeout(
                                                () =>
                                                    closeMenu(),
                                                200
                                            );
                                    }}
                                    className={
                                        "contextmenu-item"
                                    }
                                >
                                    <div
                                        className={
                                            "contextmenu-group"
                                        }
                                    >
                                        <i
                                            className={
                                                "contextmenu-item-icon"
                                            }
                                            style={{
                                                backgroundImage: `url(${item.icon})`
                                            }}
                                        ></i>
                                        {item.label}
                                        <i
                                            className={
                                                "contextmenu-item-icon arrow-right"
                                            }
                                        ></i>
                                    </div>

                                    <div
                                        className={
                                            "contextmenu-submenu-mount"
                                        }
                                    >
                                        <ContextMenu
                                            {...this
                                                .props}
                                            x={
                                                (this
                                                    .state
                                                    .submenus[
                                                    item
                                                        .id
                                                ] &&
                                                    this
                                                        .state
                                                        .submenus[
                                                        item
                                                            .id
                                                    ]
                                                        .x) ||
                                                0
                                            }
                                            y={
                                                (this
                                                    .state
                                                    .submenus[
                                                    item
                                                        .id
                                                ] &&
                                                    this
                                                        .state
                                                        .submenus[
                                                        item
                                                            .id
                                                    ]
                                                        .y) ||
                                                0
                                            }
                                            template={
                                                item.submenu
                                            }
                                            visible={
                                                this.state
                                                    .submenus[
                                                    item
                                                        .id
                                                ] &&
                                                this.state
                                                    .submenus[
                                                    item
                                                        .id
                                                ].visible
                                            }
                                            checkboxType={
                                                item.type ==
                                                "radio"
                                                    ? "circle"
                                                    : "check"
                                            }
                                            onMouseOver={() =>
                                                this.setSubmenuVisibility(
                                                    item.id,
                                                    true
                                                )
                                            }
                                        />
                                    </div>
                                </button>
                            );
                        }

                        switch (item.type) {
                            case "checkbox":
                                return (
                                    <button
                                        role="menuitemcheckbox"
                                        tabIndex={0}
                                        onClick={(e) =>
                                            this.onItemClick(
                                                e,
                                                item
                                            )
                                        }
                                        className={`contextmenu-item ${item.type}`}
                                        data-checked={
                                            item.checked
                                        }
                                        data-check-type={
                                            this.props
                                                .checkboxType ||
                                            "check"
                                        }
                                    >
                                        <i
                                            className={
                                                "contextmenu-item-icon"
                                            }
                                        ></i>

                                        {item.label}
                                    </button>
                                );
                            case "separator":
                                return (
                                    <hr
                                        role="separator"
                                        className={
                                            "contextmenu-separator"
                                        }
                                        aria-disabled={
                                            true
                                        }
                                    />
                                );
                            case "normal":
                            default:
                                return (
                                    <button
                                        role="menuitem"
                                        onClick={(e) =>
                                            this.onItemClick(
                                                e,
                                                item
                                            )
                                        }
                                        className={`contextmenu-item ${item.type}`}
                                        tabIndex={0}
                                    >
                                        <i
                                            className={
                                                "contextmenu-item-icon"
                                            }
                                            style={{
                                                backgroundImage: `url(${item.icon})`
                                            }}
                                        ></i>

                                        {item.label}
                                    </button>
                                );
                        }
                    })}
                </div>
            </menu>
        );
    }

    public onItemClick(event: any, item: MenuItem) {
        if (item.click) item.click(item, window, event);
        if (this.props.callback)
            this.props.callback(true);
    }

    public setSubmenuVisibility(
        id: string,
        value: boolean,
        x?: number,
        y?: number
    ) {
        const payload: any = {
            visible: value
        };

        if (x) payload.x = x;
        if (y) payload.y = y;

        this.setState({
            ...this.state,
            submenus: {
                [id]: {
                    ...this.state.submenus[id],
                    ...payload
                }
            }
        });
    }
}
