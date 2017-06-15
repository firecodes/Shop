﻿import { default as Service } from 'services/Service';


export interface ControlData {
    controlId: string, controlName: string, data?: any,
    selected?: boolean | 'disabled'
}

export interface PageData {
    _id: string,
    name: string,
    remark: string,
    controls?: Array<ControlData>,
    isDefault?: boolean,
    header?: { controls: ControlData[] },
    footer?: { controls: ControlData[] },
    views?: { controls: ControlData[] }[]
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
    // private _homeProduct: JData.WebDataSource;
    private url(path: string) {
        let url = `${Service.config.siteUrl}${path}`;
        return url;
    }
    // get homeProduct(): JData.WebDataSource {
    //     if (!this._homeProduct) {
    //         this._homeProduct = new JData.WebDataSource(
    //             Service.config.siteUrl + 'MicroStationData/Select?source=HomeProducts',
    //             Service.config.siteUrl + 'MicroStationData/Insert?source=HomeProducts',
    //             Service.config.siteUrl + 'MicroStationData/Update?source=HomeProducts',
    //             Service.config.siteUrl + 'MicroStationData/Delete?source=HomeProducts'
    //         );
    //     }
    //     return this._homeProduct;
    // }
    private translatePageData(pageData: PageData): PageData {
        if (pageData.views == null && pageData.controls != null) {
            pageData.views = [{ controls: pageData.controls }];
        }
        return pageData;
    }
    savePageData(pageData: PageData) {
        let url = `${Service.config.siteUrl}Page/SavePageData`;
        return Service.postByJson(url, { pageData }).then((data) => {
            Object.assign(pageData, data);
            return data;
        });
    }
    pageData(pageId: string) {
        let url = `${Service.config.siteUrl}Page/GetPageData`;
        let data = { pageId };
        return Service.get<PageData>(url, data).then(o => {
            this.translatePageData(o);
            return o;
        });
    }
    pageDataByName(pageName: string) {
        let url = `${Service.config.siteUrl}Page/GetPageDataByName`;
        let data = { pageName };
        return Service.get<PageData>(url, data).then(o => {
            this.translatePageData(o);
            return o;
        });
    }
    pageDataByTemplate(templateId: string) {
        let url = `${Service.config.siteUrl}Page/GetPageDataByTemplate`;
        let data = { templateId };
        return Service.get<PageData>(url, data).then(o => this.translatePageData(o));
    }
    /** 通过页面名称获取页面 iddata 
     * @param name 页面名称
     */
    getPageId(name: string): Promise<string> {
        let url = `${Service.config.siteUrl}Page/GetPageId`;
        return Service.get<{ "_id": string }>(url, { name }).then(o => o._id);
    }
    getPageDataByName(name: string) {
        let url = this.url('Page/GetPageDataByName');
        return Service.get<PageData>(url, { name });
    }
    getPageDatas() {
        let url = this.url('Page/GetPageDatas');
        return Service.get<PageData[]>(url).then(o => {
            return o || [];
        });
    }
    setDefaultPage(pageId: string) {
        let url = this.url('Page/SetDefaultPage');
        return Service.putByJson(url, { pageId });
    }
    pageTemplates() {
        let url = this.url('Page/GetTemplatePageDatas');
        return Service.get<TemplatePageData[]>(url);
    }
    saveImage(pageId: string, name: string, image: string) {
        let url = `${Service.config.siteUrl}Page/SaveImage`;
        return Service.postByJson(url, { pageId, name, image });
    }
    imageUrl(pageId: string, fileName: string) {
        let url = `${Service.config.imageUrl}Page/Image?pageId=${pageId}&name=${fileName}&storeId=${Service.storeId}&application-key=${Service.appToken}`;
        return url;
    }
    removeImage(pageId: string, name: string) {
        let url = `${Service.config.siteUrl}Page/RemoveImage`;
        return Service.postByJson(url, { pageId, name });
    }
    getImageNameFromUrl(imageUrl: string) {
        var arr = imageUrl.split('?');
        console.assert(arr.length == 2);
        var params = this.pareeUrlQuery(arr[1]);
        return params.name;
    }
    private pareeUrlQuery(query): any {
        let match, pl = /\+/g, search = /([^&=]+)=?([^&]*)/g, decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
        let urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);
        return urlParams;
    }
    //============================================================

    async storeStylePageData(): Promise<PageData> {
        let pageData = await this.getPageDataByName(pageNames.storeStyle);
        if (pageData == null) {
            pageData = defaultPageDatas.storeStyle;
        }
        return pageData;
    }

    async storeMenuPageData(): Promise<PageData> {
        let pageData = await this.getPageDataByName(pageNames.storeMenu);
        if (pageData == null) {
            pageData = defaultPageDatas.storeMenu;
        }
        return pageData;
    }
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
                    { controlId: guid(), controlName: 'product', selected: 'disabled' },
                    { controlId: guid(), controlName: 'style', selected: true }
                ]
            }
        ]
    } as PageData,
    storeMenu: {
        name: pageNames.storeMenu,
        footer: {
            controls: [
                { controlId: guid(), controlName: 'menu', data: { menuNodes: [{ name: '首页' }, { name: '个人中心' }] }, selected: true },
                { controlId: guid(), controlName: 'style' }
            ]
        }
    } as PageData
}

export default new StationService();