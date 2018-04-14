import { StationService } from 'userServices/stationService';
import { ShoppingService } from 'userServices/shoppingService';
import { guid } from 'userServices/service';
import { MobilePage } from 'mobileComponents/mobilePage';
import { default as ProductControl } from 'mobileComponents/product/control';

import * as React from 'react';

let dir = 'user/modules'
let siteMap = {
    nodes: {
        emtpy: { action: (page: chitu.Page) => null },
        home_index: { action: home_index_action },
        home_class: { action: home_class_action },
        home_product: { action: home_product_action },
        home_productList: { action: `${dir}/home/productList` },
        shopping_invoice: { action: `${dir}/shopping/invoice` },
        shopping_purchase: { action: `${dir}/shopping/purchase` },
        shopping_orderList: { action: `${dir}/shopping/orderList` },
        shopping_orderProducts: { action: `${dir}/shopping/orderProducts` },
        shopping_shoppingCart: { action: shopping_shoppingCart_action },
        user_index: { action: user_index_action },
        user_login: { action: `${dir}/user/login` },
        user_regions: { action: `${dir}/user/regions` },
        user_receiptEdit: { action: `${dir}/user/receiptEdit` },
        user_receiptList: { action: `${dir}/user/receiptList` },
        user_accountSecurity_mobileBinding: { action: `${dir}/user/accountSecurity/mobileBinding` }
    },
    default: null as chitu.SiteMapNode
}

if (window['userSiteMap']) {
    siteMap = window['userSiteMap']
}
else {
    window['userSiteMap'] = siteMap;
}

siteMap.default = siteMap.nodes.home_index


async function shopping_shoppingCart_action(page: chitu.Page, showMenu?: boolean) {
    let station = page.createService(StationService);
    let pageData = await station.pages.shoppingCart();
    if (showMenu != null) {
        page.data.showBackButton = false;
        pageData.showMenu = showMenu;
    }

    pageData = await station.fullPage(() => Promise.resolve(pageData));
    ReactDOM.render(<MobilePage pageData={pageData} elementPage={page} ></MobilePage>, page.element);
}

async function home_index_action(page: chitu.Page) {
    let station = page.createService(StationService);
    let pageData = await station.fullPage(() => station.pages.home());

    ReactDOM.render(<MobilePage pageData={pageData} elementPage={page} />, page.element);
}

async function home_class_action(page: chitu.Page) {
    let station = page.createService(StationService);
    let pageData = await station.fullPage(() => station.pages.categories());

    ReactDOM.render(<MobilePage pageData={pageData} elementPage={page} />, page.element);
}

async function user_index_action(page: chitu.Page) {
    let station = page.createService(StationService);
    let pageData = await station.fullPage(() => station.pages.member());
    ReactDOM.render(<MobilePage pageData={pageData} elementPage={page} />, page.element);
}

async function home_product_action(page: chitu.Page) {
    var shopping = page.createService(ShoppingService);
    let product = await shopping.product(page.data.id);

    let mobilePage: MobilePage;

    let pageData = await createPageData(shopping, page.data.id);
    ReactDOM.render(<MobilePage pageData={pageData} elementPage={page} ref={e => mobilePage = e || mobilePage} />, page.element);

    // page.showing.add(async (sender: Page, args) => {
    //     sender.showLoading();
    //     let pageData = await createPageData(shopping, page.data.id);
    //     mobilePage.state.pageData = pageData;
    //     mobilePage.setState(mobilePage.state);
    //     page.hideLoading();
    // })

    async function createPageData(shopping: ShoppingService, productId: string) {
        let product = await shopping.product(productId);
        let pageData = {
            header: {
                controls: [
                    { controlId: guid(), controlName: 'product:Header' }
                ]
            },
            views: [
                {
                    controls: [
                        { controlId: guid(), controlName: 'product', data: { product } }
                    ]
                }
            ],
            footer: {
                controls: [
                    { controlId: guid(), controlName: 'product:Footer', data: { product } }
                ]
            }
        } as PageData;
        return pageData;
    }
}


export default siteMap;

// var root: MySiteMapNode = {
//     pageName: 'home.index',
//     title: storeName,
//     children: [
//         {
//             pageName: 'home.class',
//             children: [
//                 {
//                     pageName: 'home.productList',
//                     children: [{ pageName: 'home.product', title: '商品详情' }]
//                 }
//             ]
//         },
//         { pageName: 'shopping.shoppingCart', title: '购物车' },
//         { pageName: 'home.class', title: '商品类别' },
//         {
//             pageName: 'user.index',
//             title: '用户中心',
//             children: [
//                 {
//                     pageName: 'user.receiptList',
//                     children: [
//                         { pageName: 'user.receiptEdit' }
//                     ]
//                 },
//                 { pageName: 'user.favors', title: '我的收藏' },
//                 { pageName: 'user.coupon', title: '优惠券' },
//                 {
//                     pageName: 'user.accountSecurity.index', title: '账户安全',
//                     children: [
//                         { pageName: 'user.accountSecurity.loginPassword', title: '登录密码' },
//                         { pageName: 'user.accountSecurity.mobileBinding', title: '手机绑定' },
//                         { pageName: 'user.accountSecurity.paymentPassword', title: '支付密码' }
//                     ]
//                 }
//             ]
//         }
//     ]
// }
