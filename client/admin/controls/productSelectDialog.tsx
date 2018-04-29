import { imageUrl } from 'services/service';
import { ShoppingService } from 'services/shopping';
import 'wuzhui';

requirejs(['css!controls/productSelectDialog']);

type ProductsDialogProps = {
    shopping: ShoppingService,
} & React.Props<ProductSelectDialog>;

export class ProductSelectDialog extends React.Component<ProductsDialogProps, { products: Product[] }>{

    private element: HTMLElement;
    private dataSource: wuzhui.DataSource<Product>;
    private pagingBarElement: HTMLElement;
    private searchInput: HTMLInputElement;
    private onProductSelected: (product: Product) => Promise<any> | void;

    constructor(props) {
        super(props);

        this.state = { products: null };

        var shopping = this.props.shopping;

        this.dataSource = new wuzhui.DataSource({ select: (args) => shopping.products(args) });
        this.dataSource.selectArguments.maximumRows = 15;
        this.dataSource.selectArguments.filter = '!OffShelve';

        this.dataSource.selected.add((sender, args) => {
            this.state.products = args.dataItems;
            this.setState(this.state);
        });
    }

    show(onProductSelected: (product: Product) => Promise<any> | void) {
        this.onProductSelected = onProductSelected;
        ui.showDialog(this.element);
    }

    productSelected(p: Product) {
        // if (!this.props.selected)
        //     return;

        let result = this.onProductSelected(p) || Promise.resolve();
        result.then(() => ui.hideDialog(this.element));
        // var isOK = true;
        // if (this.props.selected) {
        // isOK = this.props.selected(p);
        // }

        // if (!isOK)
        //     return;

        // ui.hideDialog(this.element);
    }

    setPagingBar(e: HTMLElement) {
        if (!e || wuzhui.Control.getControlByElement(e))
            return;
    }

    componentDidMount() {
        let pagingBar = new wuzhui.NumberPagingBar({
            dataSource: this.dataSource,
            element: this.pagingBarElement,
            pagerSettings: {
                activeButtonClassName: 'active',
                buttonWrapper: 'li',
                buttonContainerWraper: 'ul'
            },
        });
        let ul = this.pagingBarElement.querySelector('ul');
        ul.className = "pagination";
        this.dataSource.select();
    }

    renderImage(e: HTMLImageElement, src: string) {
        if (!e) return;
        ui.renderImage(e);
    }

    search(text: string) {
        this.dataSource.selectArguments["searchText"] = text || '';
        this.dataSource.select();
    }

    render() {
        let products = this.state.products;

        let c: Product[][];
        if (products != null) {
            let products1 = products.filter((o, i) => i <= 4);
            let products2 = products.filter((o, i) => i >= 5 && i <= 9);
            let products3 = products.filter((o, i) => i >= 10 && i <= 14);
            c = [products1, products2, products3].filter(o => o && o.length > 0);
        }

        let status: 'loading' | 'none' | 'finish';
        if (products == null)
            status = 'loading';
        else if (products.length == 0)
            status = 'none';
        else
            status = 'finish';

        return (
            <div className="product-select-dialog modal fade" ref={(e: HTMLElement) => this.element = e || this.element}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={() => ui.hideDialog(this.element)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 className="modal-title">选择商品</h4>
                        </div>
                        <div className="modal-body">
                            <div className="input-group">
                                <input type="text" className="form-control pull-right" placeholder="请输入SKU或名称、类别" style={{ width: '100%' }}
                                    ref={(e: HTMLInputElement) => this.searchInput = e || this.searchInput} />
                                <span className="input-group-btn">
                                    <button className="btn btn-primary btn-sm pull-right" onClick={() => this.search(this.searchInput.value)}>
                                        <i className="icon-search"></i>
                                        <span>搜索</span>
                                    </button>
                                </span>
                            </div>
                            <hr className="row" />
                            {status == 'loading' ?
                                <div className="loading">
                                    数据正在加载中...
                                </div> : null}
                            {status == 'none' ?
                                <div className="norecords">
                                    暂无商品数据
                                </div> : null}
                            {status == 'finish' ?
                                c.map((products, index) =>
                                    <div key={index} className="products">
                                        {products.map(p =>
                                            <div key={p.Id} className="product"
                                                onClick={() => this.productSelected(p)}>
                                                <img src={imageUrl(p.ImagePath, 100)} ref={(e: HTMLImageElement) => e ? ui.renderImage(e) : null} />
                                                <div className="interception">
                                                    {p.Name}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null
                            }
                            <div className="clearfix"></div>
                        </div>
                        <div className="modal-footer">
                            <div className="paging-bar"
                                ref={(e: HTMLElement) => this.pagingBarElement = e || this.pagingBarElement} >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}