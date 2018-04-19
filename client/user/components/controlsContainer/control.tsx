import { Control,ControlProps } from 'user/components/common';
export interface Props extends ControlProps<ControlsContainer> {

}
export interface State  {
    components: Array<{ name: string, props: any }>;
}
export default class ControlsContainer extends Control<Props, State> {
    get persistentMembers(){
        return []
    }

    constructor(props) {
        super(props);
        this.state = { components: [] };
    }

    _render(h) {
        let components = this.state.components;
        return (
            <div ref={(e: HTMLElement) => this.element = e || this.element}>
                {components.length > 0 ?
                    components.map(async o => {
                        return this.loadComponent(o.name, o.props);
                    }) :
                    <h4>可以将组件拖放到这里</h4>}
            </div>
        );
    }

    private async loadComponent(componentName: string, componentProps: any): Promise<React.ReactElement<any>> {
        return <div></div>
    }
}