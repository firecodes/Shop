import { Control, ControlProps } from 'mobileComponents/common';
import { imageUrl } from 'userServices/service';
import { ShoppingCartService } from 'userServices/shoppingCartService';
import { ShoppingService } from 'userServices/shoppingService';
import { ProductImage } from 'user/components/productImage';
import { app } from 'site';

// let { ImageBox } = controls;
export class Data {
    private _product: Product;

    get product() {
        return this._product;
    }
    set product(value: Product) {
        this._product = value;
    }
}

let shopping = new ShoppingService();
let shoppingCart = new ShoppingCartService();


// type ProductExt = Product & { Count: number };

export interface Props extends ControlProps<ProductListControl> {

}

type ProductsFromCategory = {
    prodcutsCount: number,
    categoryId: string,
    moduleTitle: string,
}

type ProductsByCustom = {
    productIds: string[]
    moduleTitle: string,
}

export interface State {
    products?: Product[],
    // productsType?: ProductsFromCategory | ProductsByCustom,

    //=======================================
    productSourceType: 'category' | 'custom',
    //=======================================
    // 按类别
    prodcutsCount?: number,
    categoryId?: string,
    //=======================================
    // 自定义
    productIds?: string[],
    //=======================================

    /**
     * 列表类型
     */
    listType?: 'singleColumn' | 'doubleColumn' | 'largePicture',

    /**
     * 价格右侧显示内容类型
     */
    displayType?: 'none' | 'addProduct' | 'activity',

    /** 
     * 显示商品标题，仅单列显示商品有效
     */
    displayTitle?: boolean,

    // shoppingCartItems: ShoppingCartItem[],
    imageSize?: 'small' | 'medium' | 'large',

    productCounts?: { [key: string]: number }
}

export default class ProductListControl extends Control<Props, State> {
    get persistentMembers(): (keyof State)[] {
        return [
            'productSourceType', 'prodcutsCount', 'categoryId', 'productIds',
            'listType', 'displayType', 'displayTitle', 'imageSize'
        ]
    }
    constructor(args) {
        super(args);

        let productCounts: { [key: string]: number } = {};
        for (let i = 0; i < ShoppingCartService.items.value.length; i++) {
            let item = ShoppingCartService.items.value[i];
            productCounts[item.ProductId] = item.Count;
        }

        this.state = {
            products: [], productSourceType: 'category', prodcutsCount: 1,
            productCounts
        };


        this.subscribe(ShoppingCartService.items, (shoppingCartItems) => {
            // this.state.shoppingCartItems = value;
            for (let i = 0; i < shoppingCartItems.length; i++) {
                this.state.productCounts[shoppingCartItems[i].ProductId] = shoppingCartItems[i].Count;
            }
            this.setState(this.state);
        })



        this.loadControlCSS();
        Promise.all([shopping.products(0)]).then(data => {
            let products = data[0];// as (Product & { Count: number })[];
            // let items = data[1];
            // for (let i = 0; i < products.length; i++) {
            //     let item = items.filter(o => o.ProductId == products[i].Id)[0];
            //     if (item) {
            //         products[i].Count = item.Count;
            //     }
            //     else {
            //         products[i].Count = 0;
            //     }
            // }
            this.state.products = products;
            this.setState(this.state);
        });
    }

    _render(h) {
        var products = new Array<Product>();
        return (
            <div
                ref={async (e: HTMLElement) => {
                    if (!e) return;
                    let listType = this.state.listType;
                    let element: React.ReactElement<any>;
                    switch (listType) {
                        case 'doubleColumn':
                        default:
                            element = await this.renderDoubleColumn(h);
                            break;
                        case 'singleColumn':
                            element = await this.renderSingleColumn(h);
                            break;
                    }
                    ReactDOM.render(element, e);

                }}>
            </div>
        );
    }



    async renderSingleColumn(h): Promise<JSX.Element> {

        var products = await this.products();
        let { displayTitle, productCounts, imageSize } = this.state;
        // var productCounts = this.state.productCounts;

        let leftClassName: string, rightClassName: string;// = displayTitle ? 'col-xs-4' : 'col-xs-3';
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

        return (
            <div className="singleColumnProductControl">
                {products.filter(o => o != null).map(o =>
                    <div key={o.Id} className="product single">
                        <div className={leftClassName} onClick={() => app.redirect(`home_product?id=${o.Id}`)}>
                            <img className="image img-responsive" src={imageUrl(o.ImagePath, 300)}
                                ref={(e: HTMLImageElement) => {
                                    if (!e) return;
                                    ui.renderImage(e, { imageSize: { width: 300, height: 300 } });
                                    // 
                                }} />
                        </div>
                        <div className={`content ${rightClassName}`}>
                            <div className="name interception" onClick={() => app.redirect(`home_product?id=${o.Id}`)}>
                                {o.Name}
                            </div>
                            {displayTitle ?
                                <div className="title interception">
                                    {o.Title}
                                </div> : null}
                            <div className="price-bar">
                                <span className="pull-left">
                                    ￥{o.Price.toFixed(2)}
                                </span>
                                <ProductCount key={o.Id} product={o} count={productCounts[o.Id]} />
                            </div>

                        </div>
                        <div className="clearfix"></div>
                        <hr />
                    </div>
                )}
            </div>
        );
    }

    async renderDoubleColumn(h): Promise<JSX.Element> {
        var products = await this.products();
        var productCounts = this.state.productCounts;
        return (
            <div className="singleColumnProductControl">
                {products.filter(o => o != null).map((o, i) =>
                    <div key={o.Id} className="product double col-xs-6">
                        <div onClick={() => app.redirect(`home_product?id=${o.Id}`)}>
                            <ProductImage key={i} product={o} />

                            <div className="name" onClick={() => app.redirect(`home_product?id=${o.Id}`)}>
                                {o.Name}
                            </div>
                            <div className="price-bar" onClick={(e) => e.stopPropagation()}>
                                <span className="pull-left">
                                    ￥{o.Price.toFixed(2)}
                                </span>
                                <ProductCount key={o.Id} product={o} count={productCounts[o.Id]} />
                            </div>
                        </div>
                        <div className="clearfix"></div>
                    </div>
                )}
            </div>
        );


    }


    async products(): Promise<Product[]> {
        var products: Product[];
        if (this.state.productSourceType == 'category')
            products = await shopping.productsByCategory(this.state.prodcutsCount, this.state.categoryId);
        else
            products = await shopping.productsByIds(this.state.productIds);

        products.forEach(o => o.ImagePath = o.ImagePaths[0]);
        return products;
    }



}

class ProductCount extends React.Component<
    { product: Product, count: number } & React.Props<Product>,
    {}>
{
    constructor(props) {
        super(props);

        this.state = { count: this.props.count || 0 };
    }

    async increaseCount(product: Product) {
        let count = (this.props.count || 0) + 1;
        await shoppingCart.setItemCount(product, count);
    }
    async decreaseCount(product: Product) {
        let count = (this.props.count || 0);
        if (count <= 0)
            return;

        count = count - 1;
        await shoppingCart.setItemCount(product, count);
    }
    render() {
        let product = this.props.product;
        let count = this.props.count;
        return (
            <div className="productCout pull-right">
                <i className="icon-plus-sign pull-right" onClick={() => this.increaseCount(product)} />
                {count ? [
                    <input type="text" key={0} className="pull-right" value={`${count}`}
                        onChange={(e) => {
                            if (!e) return;
                            var value = Number.parseInt((e.target as HTMLInputElement).value);
                            if (!value)
                                return;

                            shoppingCart.setItemCount(product, value);
                        }} />,
                    <i key={1} className="icon-minus-sign pull-right" onClick={() => this.decreaseCount(product)} />
                ] : null}
            </div>
        );
    }
}