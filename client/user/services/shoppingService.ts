import { Service, config, imageUrl } from 'user/services/service';

export class ShoppingService extends Service {
    constructor() {
        super();
    }
    private url(path: string) {
        return `UserShop/${path}`;
    }
    /**
     * 获取单个商品
     * @param productId 商品编号
     */
    product(productId): Promise<Product> {
        let url = this.url('Product/GetProduct');
        return this.getByJson<Product>(url, { productId })
            .then(product => this.processProduct(product));
    }
    productByProperies(groupId: string, properties: { [propName: string]: string }): Promise<Product> {
        type t = { key: string };
        var d = { groupId, filter: JSON.stringify(properties) };
        return this.getByJson<Product>(this.url('Product/GetProductByPropertyFilter'), d)
            .then(o => this.processProduct(o));
    }
    private processProduct(product: Product): Product {
        // if (!product.ImagePaths && product.ImagePath != null) {
        //     product.ImagePaths = product.ImagePath.split(',').map(o => imageUrl(o));
        // }
        // product.ImagePaths = product.ImagePaths || [];
        // product.ImagePath = product.ImagePaths[0];
        product.Arguments = product.Arguments || [];
        product.Fields = product.Fields || [];

        return product;
    }
    productIntroduce(productId: string): Promise<string> {
        let url = this.url('Product/GetProductIntroduce');
        return this.getByJson<{ Introduce: string }>(url, { productId }).then(o => o.Introduce);
    }
    products(pageIndex: number): Promise<Product[]>;
    products(categoryId: string, pageIndex: number): Promise<Product[]>;
    products(categoryId: any, pageIndex?: any): Promise<Product[]> {
        if (typeof categoryId == 'number') {
            pageIndex = categoryId;
            categoryId = null;
        }

        let url = this.url('Product/GetProducts');
        var args = { startRowIndex: pageIndex * config.pageSize } as wuzhui.DataSourceSelectArguments;
        if (categoryId != null) {
            args.filter = `ProductCategoryId=Guid.Parse('${categoryId}')`;
        }

        let result: { Products: Product[] };
        return this.getByJson<{ Products: Array<Product> }>(url, args).then(o => {
            let ids = o.Products.map(a => a.Id);
            return this.productStocks(ids).then((a) => {
                for (let i = 0; i < o.Products.length; i++) {
                    let stockRecord = a.filter(c => c.ProductId == o.Products[i].Id)[0];
                    if (stockRecord) {
                        o.Products[i].Stock = stockRecord.Quantity;
                    }
                }
                return o.Products;
            })
        })
    }

    private productStocks(productIds: string[]) {
        let url = this.url('Product/GetProductStocks');
        return this.getByJson<Array<{ ProductId: string, Quantity: number }>>(url, { productIds: productIds });
    }

    async  productsByIds(productIds: string[]) {
        if (!productIds || productIds.length == 0)
            return [];

        var url = this.url('Product/GetProductsByIds');
        var arr = await Promise.all([this.getByJson<Product[]>(url, { ids: productIds }), this.productStocks(productIds)]);
        let products = arr[0];
        let stcokRecords = arr[1];

        products.forEach(item => {
            let stockRecord = stcokRecords.filter(o => o.ProductId == item.Id)[0];
            if (stockRecord)
                item.Stock = stockRecord.Quantity;
        });

        let dic: { [key: string]: Product } = {};
        products.forEach(o => dic[o.Id] = o);
        let result = productIds.map(o => dic[o]).filter(o => o != null);
        return result;
    }
    /**
     * 
     * @param count 要获取商品的最多数量
     */
    productsByCategory(count: number, categoryId?: string) {
        var args = { startRowIndex: 0, maximumRows: count } as wuzhui.DataSourceSelectArguments;
        if (categoryId != null) {
            args.filter = `ProductCategoryId=Guid.Parse('${categoryId}')`;
        }

        let url = this.url('Product/GetProducts');
        return this.getByJson<{ Products: Array<Product> }>(url, args).then(o => {
            // o.Products.forEach(o => {
            //     o.ImagePath = imageUrl(o.ImagePath);
            // });
            return o.Products;
        })
    }

    category(categoryId: string) {
        let url = this.url('Product/GetCategory');
        return this.getByJson<ProductCategory>(url, { categoryId });
    }
    categories() {
        let url = this.url('Product/GetCategories');
        return this.getByJson<ProductCategory[]>(url);
    }
    toCommentProducts() {
        var result = this.getByJson<ProductComent[]>(this.url('Product/GetToCommentProducts'))
            .then(items => {
                items.forEach(o => o.ImageUrl = imageUrl(o.ImageUrl));
                return items;
            });
        return result;
    }
    commentedProducts() {
        var result = this.getByJson<ProductComent[]>(this.url('Product/GetCommentedProducts'))
            .then(items => {
                items.forEach(o => o.ImageUrl = imageUrl(o.ImageUrl));
                return items;
            });
        return result;
    }
    //=====================================================================
    // 收藏夹
    favorProducts() {
        return this.getByJson<FavorProduct[]>(this.url('Product/GetFavorProducts')).then(items => {
            items.forEach(o => o.ImageUrl = imageUrl(o.ImageUrl))
            return items;
        });
    }
    unfavorProduct(productId: string) {
        return this.postByJson(this.url('Product/UnFavorProduct'), { productId });
    }
    isFavored(productId: string) {
        return this.getByJson<boolean>(this.url('Product/IsFavored'), { productId });
    }
    favorProduct(productId: string) {
        return this.postByJson(this.url('Product/FavorProduct'), { productId });
    }
    //=====================================================================
    // 订单
    // balancePay(orderId: string, amount: number) {
    //     type TResult = { Id: string, Amount: number, BalanceAmount: number };
    //     return this.post<TResult>(this.url('Order/BalancePay'), { orderId: orderId, amount: amount });
    // }
    confirmOrder(orderId: string, remark: string, invoice: string) {
        let args = { orderId, remark, invoice };
        var result = this.postByJson<Order>(this.url('Order/ConfirmOrder'), args);
        return result;
    }
    myOrderList(pageIndex, type?: 'WaitingForPayment' | 'Send') {
        let args = {} as wuzhui.DataSourceSelectArguments;
        args.startRowIndex = config.pageSize * pageIndex;
        args.maximumRows = config.pageSize;
        if (type)
            args.filter = `Status="${type}"`

        return this.getByJson<Order[]>(this.url('Order/GetMyOrderList'), args)
            .then(orders => {
                orders.forEach(o => {
                    o.OrderDetails.forEach(c => c.ImageUrl = imageUrl(c.ImageUrl));
                });
                return orders;
            });
    }
    order(orderId: string): Promise<Order> {
        return this.getByJson<Order>(this.url('Order/GetOrder'), { orderId }).then(o => {
            o.OrderDetails.forEach(c => c.ImageUrl = imageUrl(c.ImageUrl));
            return o;
        });
    }
    createOrder(productIds: string[], quantities: number[]) {
        var result = this.postByJson<Order>(this.url('Order/CreateOrder'), { productIds: productIds, quantities: quantities })
            .then(function (order) {
                return order;
            });
        return result;
    }
    cancelOrder(orderId: string) {
        let url = this.url('Order/CancelOrder');
        return this.putByJson<{ Id: string, Status: string }>(url, { orderId });
    }
    ordersSummary() {
        type OrdersSummaryResult = { NotPaidCount: number, SendCount: number, ToEvaluateCount: number };
        return this.getByJson<OrdersSummaryResult>(this.url('Order/GetOrdersSummary'));
    }

    changeReceipt(orderId, receiptId) {
        var result = this.postByJson<Order>(this.url('Order/ChangeReceipt'), { orderId, receiptId });
        return result;
    }
    orderStatusText(status: string) {
        switch (status) {
            case 'Created':
                return '已创建';
            case 'WaitingForPayment':
                return '待付款';
            case 'Paid':
                return '已付款';
            case 'Send':
                return '已发货';
            case 'Received':
                return '已收货';
            case 'Canceled':
                return '已取消';
            case 'WaitingForSend':
                return '待发货';
            case 'Evaluated':
                return '已评价';
        }
    }

    //=====================================================================
    // 优惠券
    couponStatusText(status: 'available' | 'used' | 'expired') {
        switch (status) {
            case 'available':
                return '未使用'
            case 'used':
                return '已使用';
            case 'expired':
                return '已过期';
            default:
                return ''
        }
    }
    /** 获取个人优惠码 */
    myCoupons(pageIndex: number, status: string) {
        let url = this.url('Coupon/GetMyCoupons');
        return this.getByJson<CouponCode[]>(url, { pageIndex, status });
    }
    storeCoupons() {
        let url = this.url('Coupon/GetCoupons');
        return this.getByJson<Coupon[]>(url);
    }
    /** 领取优惠卷 */
    receiveCoupon(couponId: string) {
        let url = this.url('Coupon/ReceiveCouponCode');
        return this.postByJson(url, { couponId });
    }

    /** 获取订单可用的优惠劵 */
    orderAvailableCoupons(orderId: string) {
        let url = this.url('Coupon/GetAvailableCouponCodes');
        return this.getByJson<CouponCode[]>(url, { orderId });
    }

    /** 获取店铺优惠劵数量 */
    storeCouponsCount() {
        let url = this.url('Coupon/GetStoreCouponsCount');
        return this.getByJson<number>(url, {});
    }

    private resizeImage(img: HTMLImageElement, max_width: number, max_height: number): string {

        var canvas = document.createElement('canvas');

        var width: number = img.width;
        var height: number = img.height;

        // calculate the width and height, constraining the proportions
        if (width > height) {
            if (width > max_width) {
                height = Math.round(height *= max_width / width);
                width = max_width;
            }
        } else {
            if (height > max_height) {
                width = Math.round(width *= max_height / height);
                height = max_height;
            }
        }

        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        return canvas.toDataURL("/jpeg", 0.7);

    }

    /**
     * 评价晒单
     * @param score: 评分
     * @param evaluation: 评价
     * @param anonymous: 是否匿名评价
     * @param imageDatas: 多个上传的图片，用 ',' 连接
     * @param imageThumbs: 多个缩略图，用 ',' 连接
     */
    evaluateProduct(orderDetailId: string, score: number, evaluation: string, anonymous: boolean, imageDatas: string[]) {
        //let imageString = imageDatas.join(',');
        let imageThumbs = imageDatas.map(o => {
            var image = new Image();
            image.src = o;
            return this.resizeImage(image, 200, 200);
        });
        var data = {
            orderDetailId, evaluation,
            score, anonymous,
            imageDatas: imageDatas.join(','),
            imageThumbs: imageThumbs.join(','),
        };
        var result = this.postByJson<any>(this.url('Product/EvaluateProduct'), data)
        return result;
    }
    //=====================================================================
    // Address
    receiptInfos() {
        return this.getByJson<ReceiptInfo[]>(this.url('Address/GetReceiptInfos'));
    }
    receiptInfo(id: string) {
        return this.getByJson<ReceiptInfo>(this.url('Address/GetReceiptInfo'), { id })
            .then(o => {
                o.RegionId = o.CountyId;
                return o;
            });
    }
    provinces(): Promise<Region[]> {
        var result = this.getByJson<Region[]>(this.url('Address/GetProvinces'))
        return result;
    }
    cities(province: string): Promise<Region[]> {
        var guidRule = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (guidRule.test(province))
            return this.getByJson<Region[]>(this.url('Address/GetCities'), { provinceId: province });

        return this.getByJson<Region[]>(this.url('Address/GetCities'), { provinceName: province });;
    }
    counties = (cityId: string) => {
        var result = this.getByJson<Region[]>(this.url('Address/GetCounties'), { cityId: cityId });
        return result;
    }
    async saveReceiptInfo(receiptInfo: ReceiptInfo) {
        var self = this;
        let url = this.url('Address/SaveReceiptInfo');
        var result = await this.postByJson<{ Id: string, IsDefault: boolean }>(url, receiptInfo);
        Object.assign(receiptInfo, result);
        return result;
    }
    setDefaultReceiptInfo(receiptInfoId: string) {
        let url = this.url('Address/SetDefaultReceiptInfo');
        return this.putByJson(url, { receiptInfoId });
    }
    deleteReceiptInfo(receiptInfoId: string) {
        let url = this.url('Address/DeleteReceiptInfo');
        return this.deleteByJson(url, { receiptInfoId });
    }
}

