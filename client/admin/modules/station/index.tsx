/** 店铺概况　页面 */
// import { Button, ImageBox } from 'common/controls';
import { default as site } from 'site'
import { StationService } from 'adminServices/station';
import { imageUrl } from 'adminServices/service';
import { FormValidator, rules } from 'dilu';

export default async function (page: chitu.Page) {

    requirejs([`css!${page.routeData.actionPath}.css`]);

    let station = page.createService(StationService);

    class StationIndexPage extends React.Component<{ store: StoreInfo }, { store: StoreInfo }>{
        private nameInput: HTMLInputElement;
        private imageUpload: ImageUpload;
        private validator: FormValidator;

        constructor(props) {
            super(props);
            this.state = { store: this.props.store };
        }
        async save() {
            let isValid = await this.validator.check();
            if (!isValid)
                return Promise.reject({});

            if (this.imageUpload.changed) {
                var data = await station.saveImage(this.imageUpload.state.src);
                this.state.store.ImagePath = data._id;
            }
            return station.saveStore(this.state.store);
        }
        componentDidMount() {
            let { required } = rules;
            this.validator = new FormValidator(
                { element: this.nameInput, rules: [required()] }
            )
        }
        render() {
            let { store } = this.state;

            return (
                <div className="station-index">
                    <ul className="nav nav-tabs">
                        <li className="dropdown pull-right">
                            <button className="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown">
                                访问店铺
                            </button>
                            <div className="dropdown-menu dropdown-menu-right" style={{ padding: 20 }}>
                                <div style={{ width: '100%', textAlign: 'center' }}>手机扫码访问</div>
                                <img src="https://h5.youzan.com/v2/common/url/create?type=homepage&kdt_id=764664" style={{ width: 180, height: 180 }} />
                                <div style={{ width: '100%' }}>
                                    <div className="pull-left">复制页面链接</div>
                                    <div className="pull-right">
                                        <a href={site.userClientUrl} target="_blank">电脑访问</a>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="pull-right">
                            <button className="btn btn-sm btn-primary"
                                ref={(e: HTMLButtonElement) => {
                                    if (!e) return;
                                    e.onclick = ui.buttonOnClick(() => this.save(), { toast: "保存成功" });
                                }}>
                                <i className="icon-save"></i>
                                <span>保存</span>
                            </button>
                        </li>
                    </ul>
                    <div className="clearfix">
                    </div>
                    <div className="well" style={{ minHeight: 100 }}>
                        <div className="row form-group">
                            <div className="col-lg-12">
                                <label className="col-md-4" style={{ width: 120 }}>店铺名称*</label>
                                <div className="col-md-8" style={{ maxWidth: 300 }}>
                                    <input className="form-control" name="店铺名称" value={store.Name}
                                        onChange={(e) => {
                                            store.Name = (e.target as HTMLInputElement).value;
                                            this.setState(this.state);
                                        }}
                                        ref={(e: HTMLInputElement) => this.nameInput = e || this.nameInput} />
                                </div>
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-lg-12">
                                <label className="col-md-4" style={{ width: 120 }}>店铺图标</label>
                                <div className="col-md-8" style={{ maxWidth: 300 }}>
                                    <ImageUpload ref={e => this.imageUpload = e || this.imageUpload}
                                        src={store.ImagePath ? imageUrl(store.ImagePath) : null} />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* <div className="well summary">
                        <div className="pull-left text-center" style={{ width: '20%' }}>
                            <div className="number">0</div>
                            <span>微页面</span>
                        </div>
                        <div className="pull-left text-center" style={{ width: '20%' }}>
                            <div className="number">0</div>
                            <span>商品</span>
                        </div>
                        <div className="pull-left text-center" style={{ width: '20%' }}>
                            <div className="number">0</div>
                            <span>昨日浏览量</span>
                        </div>
                        <div className="pull-left text-center" style={{ width: '20%' }}>
                            <div className="number">0</div>
                            <span>昨日访客</span>
                        </div>
                        <div className="pull-left text-center" style={{ width: '20%' }}>
                            <div className="number">0</div>
                            <span>昨日访客</span>
                        </div>
                        <div className="clearfix"></div>
                    </div> */}
                </div>
            );
        }
    }

    let store = await station.store();
    ReactDOM.render(<StationIndexPage store={store} />, page.element);
}

interface ImageUploadProps extends React.Props<ImageUpload> {
    src?: string
}
interface ImageUploadState {
    src: string
}
class ImageUpload extends React.Component<ImageUploadProps, ImageUploadState>{
    private imageElement: HTMLImageElement;
    private width = 200;
    private height = 200;
    private _chnaged = false;
    constructor(props) {
        super(props);

        let emptyImage = ui.generateImageBase64(this.width, this.height, "请上传图片", { bgColor: 'white' })
        this.state = { src: this.props.src || emptyImage };
    }
    private async onFileChanged(e) {
        if (!e.files[0]) {
            return;
        }

        let data = await ui.imageFileToBase64(e.files[0], { width: this.width, height: this.height });
        this.state.src = data.base64;
        this._chnaged = true;
        this.setState(this.state);
    }
    get changed() {
        return this._chnaged;
    }
    render() {
        let src = this.state.src;
        return [
            <img key="img" style={{ width: this.width, height: this.height }}
                ref={(e: HTMLImageElement) => this.imageElement = e || this.imageElement}
                src={src} />,
            <input key="file" name="ImageUpload" type="file" id="ImageUpload" multiple={true}
                style={{ position: 'absolute', top: 0, opacity: 0, height: '100%', width: '100%' }}
                ref={(e: HTMLInputElement) => {
                    if (!e) return;
                    e.onchange = () => this.onFileChanged(e);
                }} />
        ]
    }
}