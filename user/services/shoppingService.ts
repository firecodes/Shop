namespace userServices {
    export interface Coupon {
        Id: string,
        Amount: number,
        Discount: number,
        Remark: string,
        Title: string,
        ValidBegin: Date,
        ValidEnd: Date,
    }
    export interface CouponCode {
        Id: string,
        Amount: number,
        Code: string,
        Discount: number,
        CouponId: string,
        Remark: string,
        ReceiveBegin: Date,
        ReceiveEnd: Date,
        Title: string,
        ValidBegin: Date,
        ValidEnd: Date,
        UsedDateTime: Date,
        CreateDateTime: Date,
    }
    export interface ReceiptInfo {
        Address: string,
        CityId: string,
        CityName: string,
        Consignee: string,
        CountyId: string,
        CountyName: string,
        FullAddress: string,
        Id: string,
        IsDefault: boolean,
        Mobile: string,
        Name: string,
        Phone: string,
        PostalCode: string,
        ProvinceId: string,
        ProvinceName: string,
        RegionId: string
    }
    export interface Product {
        Id: string, Arguments: Array<{ key: string, value: string }>,
        BrandId: string, BrandName: string, Price: number,
        Score: number, Unit: string, MemberPrice: number,
        Fields: Array<{ key: string, value: string }>,
        GroupId: string, ImageUrl: string, ImageUrls: Array<string>,
        ProductCategoryId: string, Name: string, //IsFavored?: boolean,
        ProductCategoryName: string,
        CustomProperties: Array<CustomProperty>,
        Promotions: Promotion[]
    }
    export interface CustomProperty {
        Name: string,
        Options: Array<{ Name: string, Selected: boolean, Value: string }>
    }
    export interface Promotion {
        Type: 'Given' | 'Reduce' | 'Discount',
        Contents: {
            Id: string,
            Description: string
        }[],
    }
    export interface ProductCategory {
        Id: string, Name: string, ImagePath: string
    }
    export interface ProductComent {
        Id: string,
        Name: string,
        ImageUrl: string,
        Status: 'Evaluated' | 'ToEvaluate',
        OrderDetailId: string,
    }
    export type FavorProduct = {
        Id: string;
        ProductId: string,
        ProductName: string,
        ImageUrl: string
    }
    export interface Order {
        Id: string,
        Amount: number,
        CouponTitle: string,
        Discount: number,
        Freight: number,
        Invoice: string,
        OrderDate: Date,
        OrderDetails: OrderDetail[],
        ReceiptAddress: string,
        Remark: string,
        Serial: string,
        Status: string,
        // StatusText: string,
        Sum: number,
    }
    export interface OrderDetail {
        // Id: string,
        ImageUrl: string,
        ProductId: string,
        ProductName: string,
        Price: number,
        Quantity: number,
        Score: number
    }
    export interface Region {
        Id: string,
        Name: string
    }
    export class ShoppingService extends Service {
        constructor() {
            super();
        }
        private url(path: string) {
            return `${config.service.shop}${path}`;
        }
        product(productId): Promise<Product> {
            let url = this.url('Product/GetProduct');
            return this.get<Product>(url, { productId })
                .then(product => this.processProduct(product));
        }
        productByProperies(groupId: string, properties: { [propName: string]: string }): Promise<Product> {
            type t = { key: string };
            var d = { groupId, filter: JSON.stringify(properties) };
            return this.get<Product>(this.url('Product/GetProductByPropertyFilter'), d)
                .then(o => this.processProduct(o));
        }
        private processProduct(product: Product): Product {
            if (!product.ImageUrls && product.ImageUrl != null) {
                product.ImageUrls = product.ImageUrl.split(',').map(o => imageUrl(o));
            }
            product.ImageUrls = product.ImageUrls || [];
            product.ImageUrl = product.ImageUrls[0];
            product.Arguments = product.Arguments || [];
            product.Fields = product.Fields || [];

            return product;
        }
        productIntroduce(productId: string): Promise<string> {
            let url = this.url('Product/GetProductIntroduce');
            return this.get<{ Introduce: string }>(url, { productId }).then(o => o.Introduce);
        }
        products(pageIndex: number): Promise<Product[]>;
        products(categoryId: string, pageIndex: number): Promise<Product[]>;
        products(categoryId: any, pageIndex?: any): Promise<Product[]> {
            if (typeof categoryId == 'number') {
                pageIndex = categoryId;
                categoryId = null;
            }

            let url = this.url('Product/GetProducts');
            var args = { startRowIndex: pageIndex * 20 } as wuzhui.DataSourceSelectArguments;
            if (categoryId != null) {
                args.filter = `ProductCategoryId=Guid.Parse('${categoryId}')`;
            }
            return this.get<{ Products: Array<Product> }>(url, args).then(o => {
                o.Products.forEach(o => {
                    o.ImageUrl = imageUrl(o.ImageUrl);
                });
                return o.Products;
            });
        }
        category(categoryId: string) {
            let url = this.url('Product/GetCategory');
            return this.get<ProductCategory>(url, { categoryId });
        }
        cateories() {
            let url = this.url('Product/GetCategories');
            return this.get<ProductCategory[]>(url).then(items => {
                items.forEach(o => o.ImagePath = imageUrl(o.ImagePath));
                return items;
            });
        }
        toCommentProducts() {
            var result = this.get<ProductComent[]>(this.url('Product/GetToCommentProducts'))
                .then(items => {
                    items.forEach(o => o.ImageUrl = imageUrl(o.ImageUrl));
                    return items;
                });
            return result;
        }
        commentedProducts() {
            var result = this.get<ProductComent[]>(this.url('Product/GetCommentedProducts'))
                .then(items => {
                    items.forEach(o => o.ImageUrl = imageUrl(o.ImageUrl));
                    return items;
                });
            return result;
        }
        //=====================================================================
        // 收藏夹
        favorProducts() {
            return this.get<FavorProduct[]>(this.url('Product/GetFavorProducts')).then(items => {
                items.forEach(o => o.ImageUrl = imageUrl(o.ImageUrl))
                return items;
            });
        }
        unfavorProduct(productId: string) {
            return this.post(this.url('Product/UnFavorProduct'), { productId });
        }
        isFavored(productId: string) {
            return this.get<boolean>(this.url('Product/IsFavored'), { productId });
        }
        favorProduct(productId: string) {
            return this.post(this.url('Product/FavorProduct'), { productId });
        }
        //=====================================================================
        // 订单
        // balancePay(orderId: string, amount: number) {
        //     type TResult = { Id: string, Amount: number, BalanceAmount: number };
        //     return this.post<TResult>(this.url('Order/BalancePay'), { orderId: orderId, amount: amount });
        // }
        confirmOrder(orderId: string, remark: string, invoice: string) {
            let args = { orderId, remark, invoice };
            var result = this.post<Order>(this.url('Order/ConfirmOrder'), args);
            return result;
        }
        myOrderList(pageIndex, type?: 'WaitingForPayment' | 'Send') {
            let args = {} as wuzhui.DataSourceSelectArguments;
            args.startRowIndex = config.pageSize * pageIndex;
            args.maximumRows = config.pageSize;
            if (type)
                args.filter = `Status="${type}"`

            return this.get<Order[]>(this.url('Order/GetMyOrderList'), args)
                .then(orders => {
                    orders.forEach(o => {
                        o.OrderDetails.forEach(c => c.ImageUrl = imageUrl(c.ImageUrl));
                    });
                    return orders;
                });
        }
        order(orderId: string): Promise<Order> {
            return this.get<Order>(this.url('Order/GetOrder'), { orderId }).then(o => {
                o.OrderDetails.forEach(c => c.ImageUrl = imageUrl(c.ImageUrl));
                return o;
            });
        }
        createOrder(productIds: string[], quantities: number[]) {
            var result = this.post<Order>(this.url('Order/CreateOrder'), { productIds: productIds, quantities: quantities })
                .then(function (order) {
                    return order;
                });
            return result;
        }
        cancelOrder(orderId: string) {
            let url = this.url('Order/CancelOrder');
            return this.put<{ Id: string, Status: string }>(url, { orderId });
        }
        ordersSummary() {
            type OrdersSummaryResult = { NotPaidCount: number, SendCount: number, ToEvaluateCount: number };
            return this.get<OrdersSummaryResult>(this.url('Order/GetOrdersSummary'));
        }

        changeReceipt(orderId, receiptId) {
            var result = this.post<Order>(this.url('Order/ChangeReceipt'), { orderId, receiptId });
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
            return this.get<CouponCode[]>(url, { pageIndex, status });
        }
        storeCoupons() {
            let url = this.url('Coupon/GetCoupons');
            return this.get<Coupon[]>(url);
        }
        /** 领取优惠卷 */
        receiveCoupon(couponId: string) {
            let url = this.url('Coupon/ReceiveCouponCode');
            return this.post(url, { couponId });
        }

        /** 获取订单可用的优惠劵 */
        orderAvailableCoupons(orderId: string) {
            let url = this.url('Coupon/GetAvailableCouponCodes');
            return this.get<CouponCode[]>(url, { orderId });
        }

        /** 获取店铺优惠劵数量 */
        storeCouponsCount() {
            let url = this.url('Coupon/GetStoreCouponsCount');
            return this.get<number>(url, {});
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
            var result = this.post<any>(this.url('Product/EvaluateProduct'), data)
            return result;
        }
        //=====================================================================
        // Address
        receiptInfos() {
            return this.get<ReceiptInfo[]>(this.url('Address/GetReceiptInfos'));
        }
        receiptInfo(id: string) {
            return this.get<ReceiptInfo>(this.url('Address/GetReceiptInfo'), { id })
                .then(o => {
                    o.RegionId = o.CountyId;
                    return o;
                });
        }
        provinces(): Promise<Region[]> {
            var result = this.get<Region[]>(this.url('Address/GetProvinces'))
            return result;
        }
        cities(province: string): Promise<Region[]> {
            var guidRule = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (guidRule.test(province))
                return this.get<Region[]>(this.url('Address/GetCities'), { provinceId: province });

            return this.get<Region[]>(this.url('Address/GetCities'), { provinceName: province });;
        }
        counties = (cityId: string) => {
            var result = this.get<Region[]>(this.url('Address/GetCounties'), { cityId: cityId });
            return result;
        }
        saveReceiptInfo(receiptInfo: ReceiptInfo) {
            var self = this;
            let url = this.url('Address/SaveReceiptInfo');
            var result = this.post<{ Id: string, IsDefault: boolean }>(url, receiptInfo);
            return result;
        }
        setDefaultReceiptInfo(receiptInfoId: string) {
            let url = this.url('Address/SetDefaultReceiptInfo');
            return this.put(url, { receiptInfoId });
        }
        deleteReceiptInfo(receiptInfoId: string) {
            let url = this.url('Address/DeleteReceiptInfo');
            return this.delete(url, { receiptInfoId });
        }
    }

}