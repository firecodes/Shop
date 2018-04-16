﻿import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ui from 'ui';
import { Service } from 'services/service';
import { shopName } from 'share/common';
import { MasterPage } from 'masterPage';
import siteMap from 'siteMap';
import site from './site';

let h = React.createElement;

class Application extends chitu.Application {

    private masterPage: MasterPage;
    constructor() {
        super(siteMap);

        ui.dialogConfig.dialogContainer = document.querySelector('.dialog-container') as HTMLElement;
        this.createMasterPage();
        this.error.add((app, err) => this.errorHandle(err));


    }

    run() {
        if (!location.hash)
            this.redirect(siteMap.nodes.user_login);

        super.run();
    }

    createMasterPage() {
        let element = document.createElement('div');
        document.body.insertBefore(element, document.body.children[0]);
        this.masterPage = ReactDOM.render(<MasterPage app={this} />, element);
        document.title = shopName;

        this.pageCreated.add((sender, page) => {

            let register = siteMap.nodes.user_register as chitu.SiteMapNode;
            let login = siteMap.nodes.user_login as chitu.SiteMapNode;

            console.assert(register.name != null);
            console.assert(login.name != null);

            if (!Service.token.value && page.name != register.name && page.name != login.name) {
                this.redirect(siteMap.nodes.user_login);
                return;
            }

            page.showing.add((sender) => this.masterPage.updateMenu(sender));
            page.hiding.add((sender) => this.masterPage.updateMenu(sender));

            page.load.add((sender, args) => {
                let element = sender.element.querySelector('admin-pc');
                if (element == null) {
                    sender.element.className = (sender.element.className || '') + ' admin-pc';
                }

                let node = siteMap.nodes.user_login as chitu.SiteMapNode;
                console.assert(node.name != null);
                console.assert(app.currentPage != null);

                this.masterPage.state.hideExistsButton = app.currentPage.name == node.name || !Service.token.value;
                this.masterPage.setState(this.masterPage.state);
            });
        })
    }

    loadCSS(pageName: string) {
        // let path = pageName.split('_').join('/');
        let pageNode = siteMap.nodes[pageName];
        console.assert(pageNode != null);
        console.assert(typeof pageNode.action == 'string');
        requirejs([`css!${pageNode.action}`]);
    }

    protected createPageElement(pageName: string): HTMLElement {
        let element = document.createElement('div');
        console.assert(this.masterPage.viewContainer != null, 'view container cannt be null.');
        let className = pageName.split('_').join('-');
        element.className = className;
        this.masterPage.viewContainer.appendChild(element);
        return element;
    }

    private errorHandle(err: Error) {
        switch (err.name) {
            case '600':     //600 为未知异常
            default:
                ui.alert({ title: '错误', message: err.message });
                console.log(err);
                break;

            case '710':
            case '724':     //724 为 token 失效
            case '601':     //601 为用户未登录异常
                var currentPage = this.currentPage;
                let isLoginPage = currentPage.name == 'user.login';
                if (isLoginPage) {
                    return;
                }
                this.redirect(siteMap.nodes["user/login"], { return: app.createUrl(currentPage.name, currentPage.data) });
                break;
            case '725':
                ui.alert({ title: '错误', message: 'application-key 配置错误' });
                break;
        }
    }
}






let app: Application = window['admin-app'] = window['admin-app'] || new Application();

export default app;