﻿import { default as Service } from 'adminServices/service';
import templates from 'adminServices/data/templates'

export interface ControlDescrtion {
    controlId: string, controlName: string, data?: any,
    selected?: boolean | 'disabled'
}


export interface TemplatePageData {
    _id: string;
    name: string;
    image: string;
}

export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

export class StationService extends Service {
    private url(path: string) {
        let url = `${Service.config.siteUrl}${path}`;
        return url;
    }
    private async fillPageData(pageData: PageData): Promise<PageData> {
        if (pageData.views == null && pageData['controls'] != null) {
            pageData.views = [{ controls: pageData['controls'] }];
        }

        let menuControlData = pageData.footer.controls.filter(o => o.controlName == 'menu')[0];
        if (!menuControlData && pageData.showMenu == true) {
            menuControlData = await this.menuControlData() as any;
            menuControlData.selected = 'disabled';
            pageData.footer.controls.push(menuControlData);
        }

        let styleControlData = pageData.footer.controls.filter(o => o.controlName == 'style')[0];
        if (!styleControlData) {
            styleControlData = await this.styleControlData() as any;
            styleControlData.selected = 'disabled';
            pageData.footer.controls.push(styleControlData);
        }
        return pageData;
    }
    private trimPageData(pageData: PageData) {

        // 深复制 pageData
        let pageDataCopy = JSON.parse(JSON.stringify(pageData));

        let trimControls = (controls: ControlDescrtion[]) => {
            return controls.filter(o => o.selected != 'disabled');
        }
        if (pageDataCopy.header) {
            pageDataCopy.header.controls = trimControls(pageDataCopy.header.controls);
        }
        if (pageDataCopy.footer) {
            pageDataCopy.footer.controls = trimControls(pageDataCopy.footer.controls);
        }
        if (pageDataCopy.views) {
            for (let i = 0; i < pageDataCopy.views.length; i++) {
                pageDataCopy.views[i].controls = trimControls(pageDataCopy.views[i].controls);
            }
        }
        return pageDataCopy;
    }
    savePageData(pageData: PageData) {
        let url = `${Service.config.siteUrl}Page/SavePageData`;
        // let _pageData = this.trimPageData(pageData);
        return this.postByJson(url, { pageData }).then((data) => {
            Object.assign(pageData, data);
            return data;
        });
    }
    pageData(pageId: string) {
        let url = `${Service.config.siteUrl}Page/GetPageData`;
        let query = { _id: pageId };
        return this.getByJson<PageData>(url, { query });
    }
    pageDataByName(name: string) {
        let url = `${Service.config.siteUrl}Page/GetPageData`;
        let query = { name };
        return this.getByJson<PageData>(url, { query }).then(o => {
            return o;
        });
    }
    pageDataByTemplate(templateId: string): Promise<PageData> {
        // let url = `${Service.config.siteUrl}Page/GetPageDataByTemplate`;
        // let data = { templateId };
        // return this.get<PageData>(url, data).then(o => this.fillPageData(o));
        var pageData = templates.filter(o => o._id == templateId).map(o => o.pageData)[0];
        return Promise.resolve(pageData);
    }
    pageDatas() {
        let url = this.url('Page/GetPageDatas');
        return this.get<PageData[]>(url).then(o => {
            return o || [];
        });
    }
    deletePageData(pageId: string) {
        let url = this.url('Page/DeletePage');
        return this.deleteByJson(url, { pageId });
    }
    setDefaultPage(pageId: string) {
        let url = this.url('Page/SetDefaultPage');
        return this.putByJson(url, { pageId });
    }
    async pageTemplates(): Promise<TemplatePageData[]> {
        return Promise.resolve(templates);
    }

    private defaultPages = {
        member: <PageData>{
            name: '*member',
            views: [{ controls: [{ controlId: guid(), controlName: 'member', selected: true }] }]
        },
        menu: <PageData>{
            name: '*menu',
            footer: { controls: [{ controlId: guid(), controlName: 'menu', selected: true }] }
        },
        style: <PageData>{
            name: '*style',
            footer: { controls: [{ controlId: guid(), controlName: 'style', selected: true }] }
        },
        categories: <PageData>{
            name: '*categories',
            views: [{ controls: [{ controlId: guid(), controlName: 'categories', selected: true }] }]
        },
        home: <PageData>{
            name: '*home',
            views: [{ controls: [{ controlId: guid(), controlName: 'summaryHeader', selected: true }] }]
        },
        shoppingCart: <PageData>{
            name: '*shoppingCart',
            className: 'shoppingCart',
            header: { controls: [{ controlId: guid(), controlName: 'shoppingCart.Header', selected: 'disabled' }] },
            views: [{ controls: [{ controlId: guid(), controlName: 'shoppingCart', selected: true }] }],
            footer: { controls: [{ controlId: guid(), controlName: 'shoppingCart.Footer', selected: 'disabled' }] }
        }
    };

    homePage(): Promise<PageData> {
        const pageName = this.defaultPages.home.name;
        return this.pageDataByName(pageName).then(pageData => {
            if (pageData == null) {
                pageData = this.defaultPages.home;
            }
            return pageData;
        });
    }

    memberPage(): Promise<PageData> {
        const pageName = this.defaultPages.member.name;
        return this.pageDataByName(pageName).then(pageData => {
            if (pageData == null) {
                pageData = this.defaultPages.member;
            }
            return pageData;
        });
    }

    menuPage(): Promise<PageData> {
        const pageName = this.defaultPages.menu.name;
        return this.pageDataByName(pageName).then(pageData => {
            if (pageData == null) {
                pageData = this.defaultPages.menu;
            }
            return pageData;
        });
    }

    stylePage(): Promise<PageData> {
        const pageName = this.defaultPages.style.name;
        return this.pageDataByName(pageName).then(pageData => {
            if (pageData == null)
                pageData = this.defaultPages.style;

            return pageData;
        });
    }

    categoriesPage(): Promise<PageData> {
        const pageName = this.defaultPages.categories.name;
        return this.pageDataByName(pageName).then(pageData => {
            if (pageData == null)
                pageData = this.defaultPages.categories;

            return pageData;
        });
    }

    shoppingCartPage(): Promise<PageData> {
        const pageName = this.defaultPages.shoppingCart.name;
        return this.pageDataByName(pageName).then(pageData => {
            if (pageData == null)
                return this.defaultPages.shoppingCart;

            return pageData;
        })
    }

    //=================================================================
    // 和图片相干的接口

    /**
     * 保存图片
     * @param name 图片名称
     * @param imageBase64 图片的 base64 字符串 
     */
    saveImage(imageBase64: string): Promise<{ _id: string }> {
        let url = `${Service.config.siteUrl}Page/SaveImage`;
        return this.postByJson<{ _id: string }>(url, { name, image: imageBase64 });
    }

    /**
     * 获取图片的 base64 字符串
     * @param name 图片名称
     */
    getImageBase64(name: string, maxWidth?: number): Promise<string> {
        let url = `${Service.config.siteUrl}Page/GetImage`;
        return this.get<string>(url, { name, maxWidth });
    }
    imageUrl(pageId: string, fileName: string) {
        let url = `${Service.config.imageUrl}Page/Image?pageId=${pageId}&name=${fileName}&storeId=${Service.storeId}&application-key=${Service.appToken}`;
        return url;
    }
    removeImage(_id: string) {
        let url = `${Service.config.siteUrl}Page/RemoveImage`;
        return this.deleteByJson(url, { _id });
    }
    private pareeUrlQuery(query): any {
        let match, pl = /\+/g, search = /([^&=]+)=?([^&]*)/g, decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
        let urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);
        return urlParams;
    }

    //============================================================
    controlData(name: string) {
        let url = this.url('Page/GetControlData');
        return this.get<ControlDescrtion>(url, { query: JSON.stringify({ controlName: name }) });
    }
    saveControlData(data: ControlDescrtion, name: string) {
        let url = this.url('Page/SaveControlData');
        (data as any).name = name;
        return this.postByJson(url, { data }).then(result => {
            Object.assign(data, result);
        });
    }
    async menuControlData() {
        let menuData = await this.controlData('menu');
        if (menuData == null) {
            menuData = { controlId: guid(), controlName: 'menu', data: {} };
        }
        return menuData;
    }
    async styleControlData() {
        let styleData = await this.controlData('style');
        if (styleData == null) {
            styleData = { controlId: guid(), controlName: 'style', data: {} };
        }
        return styleData;
    }
    //============================================================
}

let pageNames = {
    storeStyle: 'storeStyle',
    storeMenu: 'storeMenu'
}
let defaultPageDatas = {
    storeStyle: {
        name: pageNames.storeStyle,
        views: [
            {
                controls: [
                    // { controlId: guid(), controlName: 'product:Control', selected: 'disabled' },
                    // { controlId: guid(), controlName: 'style', selected: true }
                ]
            }
        ]
    } as PageData,
    storeMenu: {
        name: pageNames.storeMenu,
        footer: {
            controls: [
                { controlId: guid(), controlName: 'menu', data: { menuNodes: [{ name: '首页' }, { name: '个人中心' }] }, selected: true },
            ]
        }
    } as PageData
}

export default new StationService();