import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropTypes } from 'prop-types';
import MenuControl from 'components/menu/control';
import { Control, ControlProps, componentsDir } from 'components/common';
import { guid } from 'share/common';
import { State as StyleState } from 'components/style/control';
import { StationService } from 'user/services/stationService';
import { } from 'admin/application';
import { UserPage as UserPage } from 'user/application';
import { MemberService } from 'user/services/memberService';

export interface Props extends React.Props<MobilePage> {
    pageData: PageData;
    elementPage: UserPage;
    designTime?: {
        controlSelected?: (
            control: Control<any, any>,
            controlType: React.ComponentClass<any>
        ) => void
    };
    controlCreated?: (control: Control<any, any> & { controlName: string }) => void,
    enableMock?: boolean,
    // styleColor?: StyleColor,
}

export interface ControlDescription {
    controlId: string;
    controlName: string;
    data?: any;
    selected?: boolean | 'disabled';
}

export type ControlPair = { control: Control<any, any>, controlType: React.ComponentClass<any> }
const menuHeight = 50;
type State = { pageData: PageData, style?: StyleColor };

/**
 * 移动端页面，将 PageData 渲染为移动端页面。
 */
export class MobilePage extends React.Component<Props, State>{
    private screenElement: HTMLElement;
    private selecteControl: ControlPair;

    private headerControlsCount: number = 0;
    private footerControlsCount: number = 0;
    private viewControlsCount: number = 0;
    private createdControlCount: number = 0;

    private footerElement: HTMLElement;
    private headerElement: HTMLElement;

    controls: (Control<any, any> & { controlId: string, controlName: string })[];

    constructor(props) {
        super(props);
        this.state = {
            pageData: this.props.pageData
        };

        this.controls = [];
    }

    static getInstanceByElement(element: HTMLElement): MobilePage {
        return (element as any).mobilePage;
    }

    /**
     * 创建控件
     * @param controlData 描述控件的数据
     * @param element 承载控件的 HTML 元素
     */
    async createControlInstance(controlData: ControlDescription, element: HTMLElement): Promise<ControlPair> {
        let { controlId, controlName, data, selected } = controlData;
        let types = await MobilePage.getControlType(controlName);

        let props: ControlProps<any> = Object.assign({}, data || {});
        props.mobilePage = this;
        console.assert(this.props.elementPage != null);
        let reactElement = React.createElement(types.Control, props);
        let control: Control<any, any> = ReactDOM.render(reactElement, element);
        element.className = `${controlName}-control`;
        control.id = controlId;
        let result: ControlPair = { control, controlType: types.Control };
        return result;
    }

    /**
     * 获取控件在类型
     * @param controlName 控件的名称
     */
    static getControlType(controlName: string): Promise<{ Control: React.ComponentClass<any>, Props: { new() } }> {

        let arr = controlName.split(':');
        let fileName = arr[0];
        let name = arr[1] || 'default';
        let filePath = `${componentsDir}/${fileName}/control`;
        return new Promise((resolve, reject) => {
            requirejs([filePath], function (exports) {
                resolve({ Control: exports[name], Props: exports.Props });
            })
        })
    }

    static childContextTypes = { mobilePage: PropTypes.object };

    getChildContext(): { mobilePage: MobilePage } {
        return { mobilePage: this }
    }

    renderControls(controls: ControlDescription[]) {
        if (this.props.designTime) {
            return this.renderDesigntimeControls(controls);
        }

        return this.renderRuntimeControls(controls);
    }

    async componentDidMount() {
        let member = this.props.elementPage.createService(MemberService);
        let store = await member.store();
        this.state.style = store.Data.Style || 'default';
        this.setState(this.state);
    }

    renderRuntimeControls(controls: ControlDescription[]) {
        controls = controls || [];
        return controls.map((o, i) =>
            <div id={o.controlId} key={o.controlId}
                ref={async (e: HTMLElement) => {
                    if (!e) return;
                    var c = await this.createControlInstance(o, e);
                    var componet = Object.assign(c.control, { controlId: o.controlId, controlName: o.controlName });
                    this.controls.push(componet);
                    if (this.props.controlCreated)
                        this.props.controlCreated(componet);
                }} />
        );
    }
    renderDesigntimeControls(controls: ControlDescription[]) {
        controls = controls || [];
        return controls.map((o, i) =>
            <div id={o.controlId} key={o.controlId}
                ref={async (e: HTMLElement) => {
                    if (!e) return;

                    var c = await this.createControlInstance(o, e);
                    var componet = Object.assign(c.control, { controlId: o.controlId, controlName: o.controlName });
                    this.controls.push(componet);

                    if (o.selected != 'disabled') {
                        e.onclick = (event) => {
                            for (let i = 0; i < controls.length; i++) {
                                controls[i].selected = controls[i].controlId == o.controlId;
                            }
                            this.props.designTime.controlSelected(c.control, c.controlType);
                            event.preventDefault();
                        }
                    }

                    if (o.selected == true) {
                        this.selecteControl = c;
                    }

                    if (this.props.controlCreated)
                        this.props.controlCreated(componet);

                }} />
        );
    }

    /**
     * 渲染页面的头部
     * @param pageData 页面的数据，用于描述一个页面
     */
    renderHeader(pageData: PageData): JSX.Element {
        let headerControls = pageData.controls.filter(o => o.position == 'header');
        this.headerControlsCount = headerControls.length;
        return (
            <header key="header" className="page-header"
                ref={(e: HTMLElement) => this.headerElement = e || this.headerElement}>
                {this.renderControls(headerControls)}
            </header>
        )
    }

    /**
     * 渲染页面的脚
     * @param pageData 页面的数据，用于描述一个页面
     */
    renderFooter(pageData: PageData): JSX.Element {
        let footerControls = pageData.controls.filter(o => o.position == 'footer');
        return (
            <footer key="footer" className="page-footer"
                ref={(e: HTMLElement) => this.footerElement = e || this.footerElement}>
                {this.renderControls(footerControls)}
            </footer>
        )
    }


    /**
     * 渲染页面视图
     * @param pageData 页面数据，用于描述一个页面
     */
    renderView(pageData: PageData) {

        let designMode = this.props.designTime;
        if (designMode) {
            return this.renderDesigntimeViews(pageData);
        }

        return this.renderRuntimeViews(pageData);
    }

    renderRuntimeViews(pageData: PageData) {
        let viewControls = pageData.controls.filter(o => o.position == 'view'); //pageData.view || { controls: [] };
        return <section key={`view`} className="page-view"
            ref={(e: HTMLElement) => {
                if (!e) return;
                this.setPageElementClassName(e, pageData);
                setTimeout(() => {
                    if (this.footerElement) {
                        let height = this.footerElement.offsetHeight;
                        e.style.paddingBottom = `${height}px`;
                    }

                    if (this.headerElement) {
                        let height = this.headerElement.offsetHeight;
                        e.style.paddingTop = `${height}px`;
                    }

                }, 500);
            }}>
            {this.renderControls(viewControls)}
        </section>
    }

    private setPageElementClassName(viewElement: HTMLElement, pageData: PageData) {
        console.assert(viewElement != null);

        let pageElement = viewElement.parentElement;
        console.assert(pageElement != null);

        let className = pageElement.className;
        if (pageData.className && className.indexOf(pageData.className) < 0) {
            className = className + ' ' + pageData.className;
            pageElement.className = className;
        }
    }

    get styleColor(): StyleColor {
        return this.state.style;
    }
    set styleColor(value: StyleColor) {
        this.state.style = value;
        this.setState(this.state);
    }

    renderDesigntimeViews(pageData: PageData) {
        let sortableElement = (element: HTMLElement) => {
            type UI = { item: JQuery, placeholder: JQuery, helper: JQuery };

            let newControlIndex: number = 0;
            $(element).sortable({
                axis: "y",
                change: () => {
                    for (let i = 0; i < element.children.length; i++) {
                        if (!element.children.item(i).id) {
                            newControlIndex = i;
                            break;
                        }
                    }
                },
                receive: (event: Event, ui: UI) => {
                    let helper = ui.helper[0] as HTMLElement;
                    helper.removeAttribute('style');
                    let controlName = ui.item.attr('data-control-name');
                    let target = ui.item.attr('data-target');
                    console.assert(controlName != null);
                    ui.helper.remove();
                    if (target == 'footer')
                        pageData.controls.push({ controlId: guid(), controlName, data: {}, position: 'footer' });
                    else if (target == 'header')
                        pageData.controls.push({ controlId: guid(), controlName, data: {}, position: 'header' });
                    else {
                        let children = element.children;
                        console.assert(newControlIndex != null);
                        pageData.controls.splice(newControlIndex, 0, { controlId: guid(), controlName, data: {}, position: 'view' });
                        newControlIndex = null;
                    }

                    this.setState(this.state);
                },
                update: (event, ui) => {
                    let view_controls = [];
                    let footer_controls = [];
                    //===================================================
                    // 排序 view controls
                    for (let i = 0; i < element.children.length; i++) {
                        let child = element.children[i] as HTMLElement;
                        let control = pageData.controls.filter(o => o.controlId == child.id && o.position == 'view')[0];
                        console.assert(control != null);
                        view_controls[i] = control;
                    }
                    //===================================================
                    for (let i = 0; i < this.footerElement.children.length; i++) {
                        let child = this.footerElement.children[i] as HTMLElement;
                        let control = pageData.controls.filter(o => o.controlId == child.id && o.position == 'footer')[0];
                        footer_controls[i] = control;
                    }
                    //===================================================

                    // pageData.view.controls = view_controls;
                    // pageData.footer.controls = footer_controls;
                    let header_controls = pageData.controls.filter(o => o.position == 'header');
                    pageData.controls = [...header_controls, ...footer_controls, ...view_controls];
                }
            })
        }

        return <section key='view'
            ref={(e: HTMLElement) => {
                if (!e) return;
                sortableElement(e);
                this.setPageElementClassName(e, pageData);
                setTimeout(() => {
                    if (this.footerElement) {
                        let height = this.footerElement.offsetHeight;
                        e.style.paddingBottom = `${height}px`;
                    }

                    if (this.headerElement) {
                        let height = this.headerElement.offsetHeight;
                        e.style.paddingTop = `${height}px`;
                    }

                }, 500);
            }}
        >
            {this.renderControls(pageData.controls.filter(o => o.position == 'view'))}
        </section>
    }

    render() {
        let children = React.Children.toArray(this.props.children) || [];
        let pageData = this.state.pageData;

        this.viewControlsCount = 0;
        this.viewControlsCount = pageData.controls.filter(o => o.position == 'view').length; //this.viewControlsCount + (pageData.view.controls || []).length;

        //=========================================
        // 还不知道样式，先不渲染，确定了在渲染
        // let { style } = this.state;
        // if (style == null) {
        //     return [];
        // }
        //=========================================

        var result = [
            this.renderHeader(pageData),
            this.renderFooter(pageData),
            this.renderView(pageData),

        ];

        // if (style) {
        // let path = `../components/style/style_${style}.css`;
        // result.push(<link key={path} rel="stylesheet" href={path}></link>);
        // }

        if (this.props.designTime && this.props.designTime.controlSelected) {
            // 加上延时，否则编辑器有可能显示不出来
            setTimeout(() => {
                if (this.selecteControl != null) {
                    let c = this.selecteControl;
                    this.props.designTime.controlSelected(c.control, c.controlType);
                }
            }, 500);
        }

        return result;
    }
}

