import React from "react";
import { MenuItem, MenuPopupOptions } from '../../models/Menu';

type Props = MenuPopupOptions & { template: MenuItem[], onMouseOver?: any, visible?: boolean, checkboxType?: 'check' | 'circle' };

export class ContextMenu extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
    }

    public submenuVisibleInt: any;

    public state: any = {
        submenus: {}
    }

    public render() {
        return (
            <menu 
                className="contextmenu" 
                onMouseOver={this.props.onMouseOver}
                data-open={"visible" in this.props 
                    ? this.props.visible 
                        ? true
                        : false
                    : true}
                style={{
                    "--menu-x": `${this.props.x}px`,
                    "--menu-y": `${this.props.y}px`
                } as any}
            >
                <div className={"contextmenu-container"}>
                    {this.props.template.map(item => {
                        if (!item) return;
                        if (!item.type) item.type = "normal";

                        if (
                            (
                                item.submenu && 
                                item.submenu.length
                            ) ||
                            (
                                item.type == "radio" &&
                                item.submenu &&
                                item.submenu.find(item => item.checked)
                            )
                        ) {
                            const ref = React.createRef<HTMLDivElement>();

                            if(item.type == "radio") {
                                item.submenu = item.submenu.map(i => {
                                    if(!i.type) i.type = "checkbox";
                                    i.click = item.click;

                                    return i;
                                });
                            }

                            return <div 
                                ref={ref}
                                onMouseOver={(e) => {
                                    clearTimeout(this.submenuVisibleInt);

                                    this.submenuVisibleInt = setTimeout(() => {
                                        const opener = ref.current as HTMLDivElement;
                                        if(!opener) return;
                                        const bounds = opener.getBoundingClientRect();

                                        this.setSubmenuVisibility(
                                            item.id, 
                                            true,
                                            (bounds.x + bounds.width) - (this.props.x || 0),
                                            (bounds.y) - (this.props.y || 0)
                                        )
                                    }, 300)
                                }}
                                onMouseLeave={(e) => {
                                    clearTimeout(this.submenuVisibleInt);

                                    this.submenuVisibleInt = setTimeout(() => {
                                        this.setSubmenuVisibility(
                                            item.id, 
                                            false
                                        )
                                    }, 200)
                                }}
                                className={`contextmenu-item radio`}
                            >
                                <div className={"contextmenu-group"}>
                                    <i 
                                        className={"contextmenu-item-icon"} 
                                        style={{ backgroundImage: `url(${item.icon})` }}
                                    ></i>
                                    {item.label}
                                    <i className={"contextmenu-item-icon arrow-right"}></i>
                                </div>

                                <div className={"contextmenu-submenu-mount"}>
                                    <ContextMenu 
                                        {...this.props}
                                        x={this.state.submenus[item.id] && this.state.submenus[item.id].x || 0}
                                        y={this.state.submenus[item.id] && this.state.submenus[item.id].y || 0}
                                        template={item.submenu}
                                        visible={this.state.submenus[item.id] && this.state.submenus[item.id].visible}
                                        checkboxType={item.type == "radio" ? "circle" : "check"}
                                        onMouseOver={() => this.setSubmenuVisibility(
                                            item.id, 
                                            true
                                        )}
                                    />
                                </div>
                            </div>
                        }

                        switch(item.type) {
                            case "checkbox":
                                return <div 
                                    onClick={(e) => this.onItemClick(e, item)} 
                                    className={`contextmenu-item ${item.type}`} 
                                    data-checked={item.checked}
                                    data-check-type={this.props.checkboxType || 'check'}
                                >
                                    <i className={"contextmenu-item-icon"}></i>

                                    {item.label}
                                </div>
                            case "separator":
                                return <hr className={"contextmenu-separator"} />
                            case "normal":
                            default:
                                return <div 
                                    onClick={(e) => this.onItemClick(e, item)} 
                                    className={`contextmenu-item ${item.type}`}
                                >
                                    <i 
                                        className={"contextmenu-item-icon"} 
                                        style={{ backgroundImage: `url(${item.icon})` }}
                                    ></i>

                                    {item.label}
                                </div>
                        }
                    })}
                </div>
            </menu>
        )
    }

    public onItemClick(event: any, item: MenuItem) {
        if(item.click) item.click(item, window, event);
        if(this.props.callback) this.props.callback(true);
    }

    public setSubmenuVisibility(id: string, value: boolean, x?: number, y?: number) {
        const payload: any = {
            visible: value
        };

        if(x) payload.x = x;
        if(y) payload.y = y;

        this.setState({
            ...this.state,
            submenus: {
                [id]: {
                    ...this.state.submenus[id],
                    ...payload
                }
            }
        })
    }
}