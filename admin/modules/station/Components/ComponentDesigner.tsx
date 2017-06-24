import { MobilePageDesigner } from 'modules/Station/Components/MobilePageDesigner';
import { PageData, ControlData, guid, default as station } from 'services/Station'
import { default as StyleControl } from 'mobileComponents/style/control';

interface Props extends React.Props<ComponentDesigner> {
    controlName: string,
    target?: 'header' | 'footer' | 'default'
}

interface State {
    pageData: PageData
}

export class ComponentDesigner extends React.Component<Props, State>{
    constructor(props) {
        super(props);
        this.state = { pageData: {} };
        station.controlData(this.props.controlName).then(controlData => {
            let pageData: PageData = this.state.pageData;
            let target = this.props.target || 'default';
            if (controlData == null)
                controlData = { controlId: guid(), controlName: this.props.controlName, data: {} };

            controlData.selected = true;
            switch (target) {
                case 'header':
                    pageData.header = { controls: [controlData] };
                    break;
                case 'footer':
                    pageData.footer = { controls: [controlData] };
                    break;
                case 'default':
                    pageData.views = [{ controls: [controlData] }];
                    break;
            }

            this.setState(this.state);
        });
    }
    save(pageData: PageData) {

        let { target, controlName } = this.props;
        let controlDatas: ControlData[];
        switch (target) {
            case 'header':
                controlDatas = pageData.header.controls;
                break;
            case 'footer':
                controlDatas = pageData.footer.controls;
                break;
            default:
                controlDatas = pageData.views[0].controls;
                break;
        }

        let controlData = controlDatas.filter(o => o.controlName == controlName)[0];

        return station.saveControlData(controlData);
    }
    render() {
        let pageData = this.state.pageData;
        return (
            <MobilePageDesigner pageData={pageData} save={(pageData) => this.save(pageData)}>
                {this.props.children}
            </MobilePageDesigner>
        );
    }
}