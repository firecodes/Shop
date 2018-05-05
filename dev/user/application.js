define(["require", "exports", "react", "react-dom", "user/services/service", "user/services/stationService", "user/services/userData", "maishu-chitu", "components/mobilePage", "ui", "user/siteMap", "share/common"], function (require, exports, React, ReactDOM, service_1, stationService_1, userData_1, maishu_chitu_1, mobilePage_1, ui, siteMap_1, common_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    window['h'] = window['h'] || React.createElement;
    siteMap_1.default.nodes["empty"] = {
        action(page) {
            page.hideLoading();
        }
    };
    class Page extends maishu_chitu_1.Page {
        constructor(params) {
            super(params);
            this.showLoading();
        }
        loadCSS() {
            let path = this.name.split('_').join('/');
            requirejs([`css!user/modules/${path}`]);
        }
        showLoading() {
            let loadingView = this.element.querySelector('section.loading');
            if (loadingView == null) {
                loadingView = document.createElement('section');
                this.element.appendChild(loadingView);
            }
            else {
                loadingView.style.removeProperty('display');
            }
            loadingView.className = 'loading';
            loadingView.innerHTML = "数据正在加载中...";
            loadingView.style.textAlign = "center";
            loadingView.style.fontWeight = 'blod';
        }
        hideLoading() {
            let loadingView = this.element.querySelector('section.loading');
            if (loadingView != null) {
                loadingView.style.display = 'none';
            }
        }
    }
    exports.Page = Page;
    class Application extends maishu_chitu_1.Application {
        constructor() {
            super(siteMap_1.default);
            chitu.Page.tagName = "article";
            this.pageType = Page;
            this.error.add((s, e, p) => this.on_error(s, e, p));
        }
        createEmptyPage(element) {
            if (!element)
                throw new Error("argument element is null.");
            this.emtpyPageElement = element;
            let page = this.createPage("empty");
            return page;
        }
        createUrl(obj, args) {
            let pageName;
            if (typeof obj == 'string')
                pageName = obj;
            else {
                pageName = obj.name;
                console.assert(pageName != null);
            }
            let url = super.createUrl(pageName, args);
            let { protocol, port, host } = location;
            let baseUrl = `${protocol}//${host}/user/?appKey=${service_1.tokens.appId}`;
            url = baseUrl + url;
            return url;
        }
        createPage(pageName, value) {
            let page = super.createPage(pageName, value);
            //===================================================
            // 生成样式
            if (!this.styleloaded) {
                let element = document.createElement('div');
                document.body.appendChild(element);
                let station = page.createService(stationService_1.StationService);
                station.pages.style().then(pageData => {
                    ReactDOM.render(h(mobilePage_1.MobilePage, { pageData: pageData, elementPage: page }), element);
                });
                this.styleloaded = true;
            }
            //===================================================
            return page;
        }
        createPageElement(pageName) {
            if (pageName == 'empty')
                return this.emtpyPageElement;
            let element = document.createElement(chitu.Page.tagName);
            element.className = pageName.split('_').join('-') + " mobile-page";
            if (location.pathname.endsWith('preview.html')) {
                let container = document.querySelector('.screen');
                console.assert(container != null, 'screen is not exists.');
                container.appendChild(element);
            }
            else {
                document.body.appendChild(element);
            }
            return element;
        }
        on_error(app, err, page) {
            if (err.handled)
                return;
            switch (err.name) {
                case common_1.ErrorCodes.Unkonwn: //600 为未知异常
                default:
                    ui.alert({ title: '错误', message: err.message });
                    console.log(err);
                    break;
                case common_1.ErrorCodes.TokenInvalid: //724 为 token 失效
                case common_1.ErrorCodes.UserNotLogin://601 为用户未登录异常
                    if (err.name == '724') {
                        userData_1.userData.userToken.value = '';
                    }
                    // var currentPage = app.currentPage;
                    let pageName = page ? page.name : '';
                    let isLoginPage = pageName == 'user_login';
                    if (isLoginPage) {
                        return;
                    }
                    //========================================================
                    app.showPage(siteMap_1.default.nodes.user_login, { return: pageName });
                    let url = location.href;
                    url = url.replace(location.hash, '#user_login');
                    break;
                case '725':
                    ui.alert({ title: '错误', message: 'application-key 配置错误' });
                    break;
            }
        }
    }
    exports.Application = Application;
    let storeName = localStorage.getItem(`${service_1.urlParams.appKey}_storeName`) || '';
    ui.loadImageConfig.imageDisaplyText = storeName;
    exports.app = window["user-app"] = window["user-app"] || new Application();
});