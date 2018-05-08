var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "react", "react-dom", "prop-types", "components/common", "share/common", "user/services/memberService"], function (require, exports, React, ReactDOM, prop_types_1, common_1, common_2, memberService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const menuHeight = 50;
    /**
     * 移动端页面，将 PageData 渲染为移动端页面。
     */
    class MobilePage extends React.Component {
        constructor(props) {
            super(props);
            this.headerControlsCount = 0;
            this.footerControlsCount = 0;
            this.viewControlsCount = 0;
            this.createdControlCount = 0;
            this.state = {
                pageData: this.props.pageData
            };
            this.controls = [];
        }
        static getInstanceByElement(element) {
            return element.mobilePage;
        }
        /**
         * 创建控件
         * @param controlData 描述控件的数据
         * @param element 承载控件的 HTML 元素
         */
        createControlInstance(controlData, element) {
            return __awaiter(this, void 0, void 0, function* () {
                let { controlId, controlName, data, selected } = controlData;
                let types = yield MobilePage.getControlType(controlName);
                let props = Object.assign({}, data || {});
                props.mobilePage = this;
                console.assert(this.props.elementPage != null);
                let reactElement = React.createElement(types.Control, props);
                let control = ReactDOM.render(reactElement, element);
                element.className = `${controlName}-control`;
                control.id = controlId;
                let result = { control, controlType: types.Control };
                return result;
            });
        }
        /**
         * 获取控件在类型
         * @param controlName 控件的名称
         */
        static getControlType(controlName) {
            let arr = controlName.split(':');
            let fileName = arr[0];
            let name = arr[1] || 'default';
            let filePath = `${common_1.componentsDir}/${fileName}/control`;
            return new Promise((resolve, reject) => {
                requirejs([filePath], function (exports) {
                    resolve({ Control: exports[name], Props: exports.Props });
                });
            });
        }
        getChildContext() {
            return { mobilePage: this };
        }
        renderControls(controls) {
            if (this.props.designTime) {
                return this.renderDesigntimeControls(controls);
            }
            return this.renderRuntimeControls(controls);
        }
        componentDidMount() {
            return __awaiter(this, void 0, void 0, function* () {
                let member = this.props.elementPage.createService(memberService_1.MemberService);
                let store = yield member.store();
                this.state.style = store.Data.Style || 'default';
                this.setState(this.state);
            });
        }
        renderRuntimeControls(controls) {
            controls = controls || [];
            return controls.map((o, i) => h("div", { id: o.controlId, key: o.controlId, ref: (e) => __awaiter(this, void 0, void 0, function* () {
                    if (!e)
                        return;
                    var c = yield this.createControlInstance(o, e);
                    var componet = Object.assign(c.control, { controlId: o.controlId, controlName: o.controlName });
                    this.controls.push(componet);
                    if (this.props.controlCreated)
                        this.props.controlCreated(componet);
                }) }));
        }
        renderDesigntimeControls(controls) {
            controls = controls || [];
            return controls.map((o, i) => h("div", { id: o.controlId, key: o.controlId, ref: (e) => __awaiter(this, void 0, void 0, function* () {
                    if (!e)
                        return;
                    var c = yield this.createControlInstance(o, e);
                    var componet = Object.assign(c.control, { controlId: o.controlId, controlName: o.controlName });
                    this.controls.push(componet);
                    if (o.selected != 'disabled') {
                        e.onclick = (event) => {
                            for (let i = 0; i < controls.length; i++) {
                                controls[i].selected = controls[i].controlId == o.controlId;
                            }
                            this.props.designTime.controlSelected(c.control, c.controlType);
                            event.preventDefault();
                        };
                    }
                    if (o.selected == true) {
                        this.selecteControl = c;
                    }
                    if (this.props.controlCreated)
                        this.props.controlCreated(componet);
                }) }));
        }
        /**
         * 渲染页面的头部
         * @param pageData 页面的数据，用于描述一个页面
         */
        renderHeader(pageData) {
            let headerControls = pageData.controls.filter(o => o.position == 'header');
            this.headerControlsCount = headerControls.length;
            return (h("header", { key: "header", className: "page-header", ref: (e) => this.headerElement = e || this.headerElement }, this.renderControls(headerControls)));
        }
        /**
         * 渲染页面的脚
         * @param pageData 页面的数据，用于描述一个页面
         */
        renderFooter(pageData) {
            let footerControls = pageData.controls.filter(o => o.position == 'footer');
            return (h("footer", { key: "footer", className: "page-footer", ref: (e) => this.footerElement = e || this.footerElement }, this.renderControls(footerControls)));
        }
        /**
         * 渲染页面视图
         * @param pageData 页面数据，用于描述一个页面
         */
        renderView(pageData) {
            let designMode = this.props.designTime;
            if (designMode) {
                return this.renderDesigntimeViews(pageData);
            }
            return this.renderRuntimeViews(pageData);
        }
        renderRuntimeViews(pageData) {
            let viewControls = pageData.controls.filter(o => o.position == 'view'); //pageData.view || { controls: [] };
            return h("section", { key: `view`, className: "page-view", ref: (e) => {
                    if (!e)
                        return;
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
                } }, this.renderControls(viewControls));
        }
        setPageElementClassName(viewElement, pageData) {
            console.assert(viewElement != null);
            let pageElement = viewElement.parentElement;
            console.assert(pageElement != null);
            let className = pageElement.className;
            if (pageData.className && className.indexOf(pageData.className) < 0) {
                className = className + ' ' + pageData.className;
                pageElement.className = className;
            }
        }
        get styleColor() {
            return this.state.style;
        }
        set styleColor(value) {
            this.state.style = value;
            this.setState(this.state);
        }
        renderDesigntimeViews(pageData) {
            let sortableElement = (element) => {
                let newControlIndex = 0;
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
                    receive: (event, ui) => {
                        let helper = ui.helper[0];
                        helper.removeAttribute('style');
                        let controlName = ui.item.attr('data-control-name');
                        let target = ui.item.attr('data-target');
                        console.assert(controlName != null);
                        ui.helper.remove();
                        if (target == 'footer')
                            pageData.controls.push({ controlId: common_2.guid(), controlName, data: {}, position: 'footer' });
                        else if (target == 'header')
                            pageData.controls.push({ controlId: common_2.guid(), controlName, data: {}, position: 'header' });
                        else {
                            let children = element.children;
                            console.assert(newControlIndex != null);
                            pageData.controls.splice(newControlIndex, 0, { controlId: common_2.guid(), controlName, data: {}, position: 'view' });
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
                            let child = element.children[i];
                            let control = pageData.controls.filter(o => o.controlId == child.id && o.position == 'view')[0];
                            console.assert(control != null);
                            view_controls[i] = control;
                        }
                        //===================================================
                        for (let i = 0; i < this.footerElement.children.length; i++) {
                            let child = this.footerElement.children[i];
                            let control = pageData.controls.filter(o => o.controlId == child.id && o.position == 'footer')[0];
                            footer_controls[i] = control;
                        }
                        //===================================================
                        // pageData.view.controls = view_controls;
                        // pageData.footer.controls = footer_controls;
                        let header_controls = pageData.controls.filter(o => o.position == 'header');
                        pageData.controls = [...header_controls, ...footer_controls, ...view_controls];
                    }
                });
            };
            return h("section", { key: 'view', ref: (e) => {
                    if (!e)
                        return;
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
                } }, this.renderControls(pageData.controls.filter(o => o.position == 'view')));
        }
        render() {
            let children = React.Children.toArray(this.props.children) || [];
            let pageData = this.state.pageData;
            this.viewControlsCount = 0;
            this.viewControlsCount = pageData.controls.filter(o => o.position == 'view').length; //this.viewControlsCount + (pageData.view.controls || []).length;
            //=========================================
            // 还不知道样式，先不渲染，确定了在渲染
            let { style } = this.state;
            if (style == null) {
                return [];
            }
            //=========================================
            var result = [
                this.renderHeader(pageData),
                this.renderFooter(pageData),
                this.renderView(pageData),
            ];
            // if (style) {
            let path = `../components/style/style_${style}.css`;
            result.push(h("link", { key: path, rel: "stylesheet", href: path }));
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
    MobilePage.childContextTypes = { mobilePage: prop_types_1.PropTypes.object };
    exports.MobilePage = MobilePage;
});
