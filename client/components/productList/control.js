var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "components/common", "user/services/service", "user/services/shoppingCartService", "user/services/shoppingService", "user/site", "user/siteMap", "art-template"], function (require, exports, common_1, service_1, shoppingCartService_1, shoppingService_1, site_1, siteMap_1, template) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    requirejs(['css!user/controls/productImage']);
    class Data {
        get product() {
            return this._product;
        }
        set product(value) {
            this._product = value;
        }
    }
    exports.Data = Data;
    class ProductListControl extends common_1.Control {
        get persistentMembers() {
            return [
                'productSourceType', 'productsCount', 'categoryId', 'productIds',
                'listType', 'displayType', 'imageSize', 'productNameLines',
                'showFields', 'productTemplate'
            ];
        }
        constructor(args) {
            super(args);
            let productCounts = {};
            for (let i = 0; i < shoppingCartService_1.ShoppingCartService.items.value.length; i++) {
                let item = shoppingCartService_1.ShoppingCartService.items.value[i];
                productCounts[item.ProductId] = item.Count;
            }
            this.state = {
                productsCount: 1, productCounts,
                productSourceType: 'category', productNameLines: 'singleLine',
                showFields: 'independent', imageSize: 'small',
                listType: 'doubleColumn'
            };
            this.subscribe(shoppingCartService_1.ShoppingCartService.items, (shoppingCartItems) => {
                for (let i = 0; i < shoppingCartItems.length; i++) {
                    this.state.productCounts[shoppingCartItems[i].ProductId] = shoppingCartItems[i].Count;
                }
                this.setState(this.state);
            });
            let props = this.props;
            this.shopping = this.props.mobilePage.props.elementPage.createService(shoppingService_1.ShoppingService);
            this.shoppingCart = this.props.mobilePage.props.elementPage.createService(shoppingCartService_1.ShoppingCartService);
            this.loadControlCSS();
            this.stateChanged.add(() => {
            });
        }
        _render(h) {
            let productTemplate = this.state.productTemplate || this.productTemplate();
            return (h("div", { className: "product-list-control", ref: (e) => __awaiter(this, void 0, void 0, function* () {
                    if (!e)
                        return;
                    var products = yield this.products();
                    if (products.length == 0) {
                        ReactDOM.render(h("div", { className: "text-center", style: { height: 200, padding: 100 } }, "\u6682\u65E0\u53EF\u663E\u793A\u7684\u5546\u54C1"), e);
                        return;
                    }
                    let html = "";
                    products.map(o => {
                        let product = o;
                        let name = this.productDisplayName(product);
                        let price = `￥${product.Price.toFixed(2)}`;
                        let image = service_1.imageUrl(product.ImagePath, 200, 200);
                        let stock = product.Stock;
                        let offShelve = product.OffShelve;
                        let id = product.Id;
                        let data = { name, price, image, stock, offShelve, id };
                        html = html + template.render(productTemplate, data);
                    });
                    //====================================
                    // 设置延时为了让页面完全渲染完成
                    setTimeout(() => {
                        e.innerHTML = html;
                        let q = e.querySelectorAll('[product-id]');
                        for (let i = 0; i < q.length; i++) {
                            let o = q.item(i);
                            this.elementOnClick(o, () => {
                                let productId = o.getAttribute('product-id');
                                if (!productId) {
                                    ui.alert({ title: '错误', message: 'Product id is emtpy.' });
                                }
                                site_1.app.redirect(siteMap_1.default.nodes.home_product, { pageId: productId });
                            });
                        }
                    }, 100);
                    //====================================
                }) }));
        }
        productTemplate() {
            let { listType } = this.state;
            let productTemplate;
            switch (listType) {
                case 'doubleColumn':
                default:
                    productTemplate = this.doubleColumnTemplate();
                    break;
                case 'singleColumn':
                    productTemplate = this.singleColumnTemplate();
                    break;
            }
            return productTemplate;
        }
        doubleColumnTemplate() {
            let imageTemplate = this.createProductImageTemplate();
            let infoTemplate = this.createProductInfoTemplate();
            let tmp = `
<div class="product double col-xs-6">
    <div class="btn-link" product-id="{{id}}">
    ${imageTemplate}
    </div>
    ${infoTemplate}
</div>`;
            return tmp;
        }
        singleColumnTemplate() {
            let { imageSize } = this.state;
            let leftClassName, rightClassName; // = displayTitle ? 'col-xs-4' : 'col-xs-3';
            // let rightClassName = displayTitle ? 'col-xs-8' : 'col-xs-9';
            switch (imageSize) {
                case 'small':
                default:
                    leftClassName = 'col-xs-3';
                    rightClassName = 'col-xs-9';
                    break;
                case 'medium':
                    leftClassName = 'col-xs-4';
                    rightClassName = 'col-xs-8';
                    break;
                case 'large':
                    leftClassName = 'col-xs-5';
                    rightClassName = 'col-xs-7';
                    break;
            }
            let imageTemplate = this.createProductImageTemplate();
            let infoTemplate = this.createProductInfoTemplate();
            // let leftHTMLE = template.render(imageTemplate,ar)
            let template = `
        <div class="product single">
            <div class="${leftClassName} btn-link" product-id="{{id}}">
                ${imageTemplate}
            </div>
            <div class="${rightClassName}">
                ${infoTemplate}
            </div>
            <div class="clearfix"></div>
        </div>
        <hr></hr>`;
            return template;
        }
        products() {
            return __awaiter(this, void 0, void 0, function* () {
                var products;
                if (this.state.productSourceType == 'category')
                    products = yield this.shopping.productsByCategory(this.state.productsCount, this.state.categoryId);
                else {
                    products = yield this.shopping.productsByIds(this.state.productIds);
                }
                // products.forEach(o => o.ImagePath = o.ImagePaths[0]);
                return products;
            });
        }
        productDisplayName(product) {
            let { showFields } = this.state;
            if (!showFields || product.Fields.length == 0)
                return product.Name;
            let fields = product.Fields.map(o => o.value).join(',');
            return `${product.Name}(${fields})`;
        }
        createProductImageTemplate() {
            let tmp = `
        <img class="product-image" src="{{image}}"/>
        {{if(offShelve || stock == 0)}}
        <div class="product-image-mask"></div>
        <div class="product-image-text">{{offShelve ? '已下架' : '已售罄'}}</div>
        {{/if}}`;
            return tmp;
        }
        createProductInfoTemplate() {
            var { productCounts, productNameLines, showFields } = this.state;
            let titleClassName = productNameLines == 'singleLine' ? 'name single-line' : 'name double-line';
            let tmp = `
        <div class='${titleClassName} btn-link' product-id="{{id}}">{{name}}</div>
        <div class="price-bar">
            <span class="pull-left">{{price}}</span>
            <div class="product-count">
            </div>
        </div>`;
            return tmp;
        }
    }
    exports.default = ProductListControl;
    class ProductCount extends React.Component {
        constructor(props) {
            super(props);
            chitu.Page.prototype.createService;
            this.state = { count: this.props.count || 0 };
            this.shoppingCart = this.props.createService(shoppingCartService_1.ShoppingCartService);
        }
        increaseCount(product) {
            return __awaiter(this, void 0, void 0, function* () {
                let count = (this.props.count || 0) + 1;
                yield this.shoppingCart.setItemCount(product, count);
            });
        }
        decreaseCount(product) {
            return __awaiter(this, void 0, void 0, function* () {
                let count = (this.props.count || 0);
                if (count <= 0)
                    return;
                count = count - 1;
                yield this.shoppingCart.setItemCount(product, count);
            });
        }
        render() {
            let product = this.props.product;
            let count = this.props.count;
            return (h("div", { className: "product-count pull-right" },
                h("i", { className: "icon-plus-sign pull-right", onClick: () => this.increaseCount(product) }),
                count ? [
                    h("input", { type: "text", key: 0, className: "pull-right", value: `${count}`, onChange: (e) => {
                            if (!e)
                                return;
                            var value = Number.parseInt(e.target.value);
                            if (!value)
                                return;
                            this.shoppingCart.setItemCount(product, value);
                        } }),
                    h("i", { key: 1, className: "icon-minus-sign pull-right", onClick: () => this.decreaseCount(product) })
                ] : null));
        }
    }
});
