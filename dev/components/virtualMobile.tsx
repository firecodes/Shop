import { Control } from 'components/common';
import { default as StyleControl } from 'components/style/control';
requirejs(['css!content/devices.css']);


export class VirtualMobile extends React.Component<React.Props<VirtualMobile>, {}>{
    private _screenElement: HTMLElement;
    constructor(props) {
        super(props);
    }
    
    get screenElement() {
        return this._screenElement;
    }

    render() {
        let children = React.Children.toArray(this.props.children) || [];
        return (
            <div className="marvel-device iphone5c blue">
                <div className="top-bar"></div>
                <div className="sleep"></div>
                <div className="volume"></div>
                <div className="camera"></div>
                <div className="sensor"></div>
                <div className="speaker"></div>
                <div className="screen"
                    ref={(e: HTMLElement) => {
                        if (!e) return;
                        this._screenElement = e;
                    }}>
                    {children}
                </div>
                <div className="home"></div>
                <div className="bottom-bar"></div>
            </div>
        );
    }


}