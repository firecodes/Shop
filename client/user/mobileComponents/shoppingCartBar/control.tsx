import { Control, ControlProps, componentsDir } from 'mobileComponents/common';

export interface Props extends ControlProps<ShoppingCartBarControl> {

}

export interface State {

}

requirejs([`css!${componentsDir}/shoppingCartBar/control`]);

export default class ShoppingCartBarControl extends Control<Props, State>{
    constructor(props) {
        super(props);
    }

    get persistentMembers(): (keyof State)[] {
        return null;
    }

    _render() {
        return (
            <div className="settlement">
                <div className="pull-left">
                    <i className="icon-shopping-cart"></i>
                </div>
                <div className="pull-right">
                    <label>总计：<span className="price">￥0.00</span></label>
                    <button className="btn btn-primary" disabled={true}>结算</button></div>
            </div>
        );
    }
}