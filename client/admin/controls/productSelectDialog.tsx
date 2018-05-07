import { imageUrl } from 'admin/services/service';
import { ShoppingService } from 'admin/services/shopping';
import ImageThumber from './imageThumber';
import 'wuzhui';

requirejs(['less!admin/controls/productSelectDialog']);

type ProductsDialogProps = {
    shopping: ShoppingService,
} & React.Props<ProductSelectDialog>;

type ProductsDialogState = {
    products: Product[],
    selecteItems: Product[],
}

export class ProductSelectDialog extends React.Component<ProductsDialogProps, ProductsDialogState>{

    private element: HTMLElement;
    private dataSource: wuzhui.DataSource<Product>;
    private pagingBarElement: HTMLElement;
    private searchInput: HTMLInputElement;
    private onProductSelected: (product: Product) => Promise<any> | void;

    constructor(props) {
        super(props);

        this.state = { products: null, selecteItems: [] };

        var shopping = this.props.shopping;

        this.dataSource = new wuzhui.DataSource({ select: (args) => shopping.products(args) });
        this.dataSource.selectArguments.maximumRows = 18;
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

    selecteProduct(p: Product) {

        if (this.state.selecteItems.indexOf(p) >= 0) {
            this.state.selecteItems = this.state.selecteItems.filter(o => o != p);
        }
        else {
            this.state.selecteItems.push(p);
        }
        this.setState(this.state);

        // if (!this.props.selected)
        //     return;

        // let result = this.onProductSelected(p) || Promise.resolve();
        // result.then(() => ui.hideDialog(this.element));


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
        let { products, selecteItems } = this.state;
        let status: 'loading' | 'none' | 'finish';
        if (products == null)
            status = 'loading';
        else if (products.length == 0)
            status = 'none';
        else
            status = 'finish';

        return (
            <div className="product-select-dialog modal fade" ref={(e: HTMLElement) => this.element = e || this.element}>
                <div className="modal-dialog modal-lg">
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
                                <div className="products">
                                    {products.map(p => {
                                        let selected = selecteItems.indexOf(p) >= 0;
                                        return <div key={p.Id} className="product col-lg-2"
                                            onClick={() => this.selecteProduct(p)}>
                                            <ImageThumber imagePath={p.ImagePath}
                                                text={p.Name}
                                                selectedText={selecteItems.indexOf(p) >= 0 ? `${selecteItems.indexOf(p) + 1}` : ''} />
                                        </div>
                                    }

                                    )}
                                </div>
                                : null
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