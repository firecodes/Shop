import { StationService } from "../services/station";
import 'css!admin/controls/pageSelectDialog';

interface Props extends React.Props<PageSelectDialog> {
    station: StationService
}
interface Item {
    Id: string, Name: string
}
interface State {
    items: Item[];

}
export class PageSelectDialog extends React.Component<Props, State> {
    callback: (item: Item) => void;
    pagingBarElement: HTMLElement;
    element: HTMLElement;
    dataSource: wuzhui.DataSource<Item>;

    constructor(props) {
        super(props);
        let { station } = this.props;
        this.state = { items: [] };
        this.dataSource = new wuzhui.DataSource({
            select: (args) => station.pageList(args)
        })
        this.dataSource.selected.add((sender, data) => {
            this.state.items = data.dataItems;
            this.setState(this.state);
        })
    }
    show(callback: (item: Item) => void) {
        this.dataSource.selectArguments.startRowIndex = 0;
        this.dataSource.select();
        ui.showDialog(this.element);
        this.callback = callback;
    }
    componentDidMount() {
        let pagingBar = new wuzhui.NumberPagingBar({
            dataSource: this.dataSource,
            element: this.pagingBarElement,
            pagerSettings: {
                activeButtonClassName: 'active',
                buttonWrapper: 'li',
                buttonContainerWraper: 'ul',
                showTotal: true
            },
        });
        let ul = this.pagingBarElement.querySelector('ul');
        ul.className = "pagination";
    }
    selecteItem(item: Item) {
        if (!this.callback)
            return;

        this.callback(item);
        ui.hideDialog(this.element);
    }
    render() {
        let { items } = this.state;
        return <div className="page-select-dialog modal fade"
            ref={(e: HTMLElement) => this.element = e || this.element}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={() => ui.hideDialog(this.element)}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 className="modal-title">选择页面</h4>
                    </div>
                    <div className="modal-body">
                        <ul>
                            {items.map((o, i) =>
                                <li key={i} className="btn-link" title="点击选择页面"
                                    onClick={() => this.selecteItem(o)}>{o.Name}</li>
                            )}
                        </ul>
                    </div>
                    <div className="modal-footer"
                        ref={(e: HTMLElement) => this.pagingBarElement = e || this.pagingBarElement}>
                    </div>
                </div>
            </div>
        </div>;
    }
}