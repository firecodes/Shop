import { componentsDir,Control } from 'mobileComponents/common';
export interface MenuNode {
    name: string,
    children?: MenuNode[]
}
export interface Props extends React.Props<MenuControl> {
    menuNodes: MenuNode[]
}
export interface State {
    menuNodes: MenuNode[]
}
requirejs(['css!mobileComponents/menu/control.css']);
export default class MenuControl extends Control<Props, State>{
    constructor(props) {
        super(props);
        this.state = { menuNodes: this.props.menuNodes };
    }
    renderChildren(h) {
        return (
            <div className="menuControl">
                {this.props.menuNodes.length <= 0 ?
                    <ul className="menu"></ul> :
                    <ul className="menu">
                        {this.props.menuNodes.map((o, i) => {
                            let itemWidth = 100 / this.props.menuNodes.length;
                            return <li key={i} style={{ width: `${itemWidth}%` }}>{o.name}</li>;
                        })}
                    </ul>
                }
            </div>
        );
    }
}