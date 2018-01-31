export interface MenuNode {
    Title: string,
    Icon?: string,
    Url?: string,
    Children?: MenuNode[],
    Parent?: MenuNode,
    Visible?: boolean
};

export let menuData: MenuNode[] = [
    { Title: '首页', Icon: 'icon-dashboard', Url: 'home/index', Visible: true },
    {
        Title: "微店",
        Icon: "icon-home",
        Children: [
            { Title: '店铺设置', Url: 'station/index' },
            { Title: '店铺首页', Url: 'station/pages/home' },
            {
                Title: '会员主页',
                Url: 'station/storeMember'
            },
            {
                Title: '店铺导航',
                Url: 'station/storeMenu'
            },
            {
                Title: '购物车',
                Url: 'station/shoppingCart'
            },
            {
                Title: '店铺风格',
                Url: 'station/storeStyle'
            },
            {
                Title: '商品类别',
                Url: 'station/storeCategories'
            },
            {
                Title: '页面管理',
                Icon: "icon-bullhorn",
                Url: 'station/pageList',
                Children: [
                    { Title: '页面', Url: 'station/page', Visible: false },
                    { Title: '页面', Url: 'station/page1', Visible: false }
                ],
                Visible: false
            },
        ]
    },
    {
        Title: "商品",
        Icon: "icon-gift",
        Children: [
            {
                Url: "shopping/productList", Title: "商品列表",
                Children: [
                    { Url: 'shopping/product/productEdit', Title: "", Visible: false }
                ]
            },
            { Url: "shopping/brandList", Title: "商品品牌" },

        ]
    },
    {
        Title: "订单",
        Icon: "icon-list",
        Children: [
            { Title: '订单列表', Url: "shopping/orderList", }
        ]
    },
    {
        Title: '营销',
        Icon: "icon-bullhorn",
        Children: [
            {
                Title: "促销活动",
                Icon: "icon-bullhorn",
                Url: "shopping/promotion/activities",
                Children: [
                    { Title: "", Url: "shopping/promotion/activityEdit" },
                    { Title: "", Url: "shopping/promotion/activityEdit1" }
                ]
            },
            {
                Icon: "icon-bullhorn",
                Title: "优惠券",
                Children: [
                    {
                        Url: "coupon/couponList", Title: "优惠券",
                        Children: [
                            { Url: "coupon/couponEdit", Title: "优惠券编辑", Visible: false },
                        ]
                    },
                    { Url: "coupon/couponSetting", Title: "赠劵规则" }
                ],

            },
            { Url: "coupon/couponCodeList", Title: "优惠码" }
        ]
    },
    {
        Title: "会员",
        Icon: "icon-group",
        Children: [
            { Url: "member/memberList", Title: "会员列表" },
        ]
    },
    // {
    //     Title: '财务',
    //     Icon: 'icon-money',
    //     Children: [
    //         { Title: '我的收入', Url: 'finance/income', },
    //         { Title: '储值资金', Url: 'finance/rechargeAmount' },
    //     ]
    // },
    {
        Title: "设置",
        Icon: " icon-cog",
        Children: [
            { Title: "账号设置", Url: 'user/changePassword' },
            {
                Title: "运费设置",
                Children: [
                    {
                        Url: "freight/solutionList", Title: "快递发货",
                        Children: [{ Title: '运费设置', Url: 'freight/freightList' }]
                    },
                    // { Url: "Freight/ProductFreightList", Title: "产品运费" },
                    { Url: 'freight/inCitySend', Title: '同城配送' },
                ]
            },
            { Url: 'shopping/paymentSetting', Title: '支付设置' },
            { Url: 'weixin/setting', Title: '公众号设置' },
        ]
    },
    {
        Title: 'Others',
        Children: [
            { Url: "user/login", Title: '登录' },
            { Url: 'user/register', Title: '注册' },
            { Url: 'user/myStores', Title: '我的店铺' }
        ],
        Visible: false
    }
];

let stack = new Array<MenuNode>();
for (let i = 0; i < menuData.length; i++) {
    stack.push(menuData[i]);
}
while (stack.length > 0) {
    let node = stack.pop();
    let children = node.Children || [];
    children.forEach((c) => {
        c.Parent = node;
        stack.push(c);
    })
}

// export default menuData;