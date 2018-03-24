import { parseUrlParams } from 'share/common';
import { socket_url, loadjs, WebSockentMessage } from 'weixin/common'
import { WeiXinService } from 'services/weixin'
import { websocketUrl } from 'share/common';
import { Service, systemWeiXinAppId } from 'services/service';
import app from 'application';
import QRCode = require('qrcode');

let q = location.search ? parseUrlParams(location.search) : {};
let openid: string = "";

export interface Props {
    weixin: WeiXinService,
    title: string,
    buttonText: string,
    content: {
        normal: string,
        success: string,
        fail: string,
    }
}

const action = 'openid'
/**
 * 用于获取 OpenId ，并把 OpenId 发送会指定的页面
 */
export class OpenIdPage extends React.Component<Props, { status: 'success' | 'fail' | 'normal' }> {
    private socket;
    constructor(props) {
        super(props);
        this.state = { status: 'normal' };
        document.title = this.props.title;
        this.init();
    }

    async init() {
        let io = await loadjs<any>('socket.io');
        let socket = io(socket_url);
        this.socket = socket;
        socket.on('connect', () => {
            let msg: WebSockentMessage = { to: q.from, from: socket.id, action: `${action}_scan` }
            socket.emit("weixin", msg);
        })

        socket.on("weixin", (data: WebSockentMessage) => {
            data = data || {} as WebSockentMessage;
            if (data.action == `${action}_success`) {
                this.state.status = 'success';
                this.setState(this.state);
            }
            else if (data.action == `${action}_fail`) {
                this.state.status = 'fail';
                this.setState(this.state);
            }
        })
    }

    async openId(): Promise<string> {
        if (openid) {
            return openid;
        }

        let weixin = this.props.weixin;
        if (!q.code) {
            throw new Error("Cannt get openid")
        }

        openid = await weixin.openId(q.code);
        console.log(openid);
        return openid;
    }
    async bind() {
        let openId = await this.openId();
        debugger;
        let msg: WebSockentMessage = { to: q.from, from: this.socket.id, data: { openId }, action: `${action}_execute` };
        this.socket.emit("weixin", msg);
    }
    cancel() {
        app.back();
    }
    render() {
        let { status } = this.state;
        let text = this.props.content[status];

        let buttonBar = status == 'normal' ?
            <div key={20} className="container" style={{ bottom: 0, position: 'absolute', width: '100%' }}>
                <div className="form-group">
                    <button className="btn btn-primary btn-block"
                        ref={(e: HTMLButtonElement) => {
                            if (!e) return;
                            ui.buttonOnClick(e, () => this.bind())
                        }}>{this.props.buttonText}</button>
                </div>
            </div> : null;

        return [
            <div key={10} style={{ paddingTop: 200, textAlign: 'center' }} className="container">
                <div></div>
                <h3>
                    {text}
                </h3>
            </div>,
            buttonBar
        ]
    }
    static createUrl(from: string, page: 'binding' | 'unbinding' | 'login') {
        let { protocol, hostname, pathname, port } = location;
        return `${protocol}//${hostname}${pathname}weixin/?from=${from}#${page}`
    }
}

var qrcodeDialog: QRCodeDialog

/**
 * 显示二维码，让手机扫描，用于 PC 端
 * @param element 对话框元素 
 * @param mobilePageName 要打开的手机端页面名称
 * @param callback 获取到 openid 后的回调函数
 */
export function showQRCodeDialog(options: {
    title: string, tips: string, element: HTMLElement,
    mobilePageName: 'binding' | 'unbinding' | 'login', callback: (openid: string) => Promise<any>
}): Promise<any> {

    if (qrcodeDialog == null) {
        let element = document.createElement('div')
        document.body.appendChild(element)
        qrcodeDialog = ReactDOM.render(
            <QRCodeDialog title={options.title} tips={options.tips} />,
            element
        )
    }

    return new Promise((resolve, reject) => {

        requirejs(['socket.io'],
            (io) => {
                var socket = io(websocketUrl);
                let { protocol, hostname, pathname, port } = location;
                socket.on('connect', () => {
                    console.log(socket.id);
                    let appid = systemWeiXinAppId;
                    let redirect_uri = encodeURIComponent(`${protocol}//${hostname}${pathname}weixin/?from=${socket.id}#${options.mobilePageName}`);
                    let auth_url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base#wechat_redirect`
                    qrcodeDialog.show(auth_url);

                    resolve()
                })
                socket.on('weixin', (msg: WebSockentMessage) => {
                    let data: any = msg.data;
                    switch (msg.action) {
                        case `${action}_execute`:
                            debugger;
                            options.callback(data.openId)
                                .then(() => {
                                    // 发送消息，告诉手机端执行成功
                                    console.assert(msg.from != socket.id)
                                    qrcodeDialog.hide();
                                    socket.emit("weixin", { to: msg.from, form: socket.id, action: `${action}_success` });
                                    
                                })
                                .catch(() => {
                                    // 发送消息，告诉手机端执行失败
                                    console.assert(msg.from != socket.id);
                                    qrcodeDialog.hide();
                                    socket.emit("weixin", { to: msg.from, form: socket.id, action: `${action}_fail` });
                                });
                            break;
                        case `${action}_scan`:
                            qrcodeDialog.state.scaned = true;
                            qrcodeDialog.setState(qrcodeDialog.state);
                            break;
                    }
                });
                socket.on('error', (err) => {
                    reject(err)
                })
            },
            (err) => reject(err)
        )
    })
}

interface QRCodeDialogProps {
    title: string,
    tips: string
}

interface QRCodeDialogState {
    scaned: boolean
}

class QRCodeDialog extends React.Component<QRCodeDialogProps, QRCodeDialogState>{
    private dialogContainer: HTMLElement;
    private dialogElement: HTMLElement;
    private qrcodeElement: HTMLElement;
    private img: HTMLImageElement;

    constructor(props) {
        super(props)
        this.state = { scaned: false }
    }

    componentDidMount() {
        ui.renderImage(this.img, { imageText: '正在生成二维码' });
        this.dialogContainer = this.dialogElement.parentElement;
    }

    render() {
        let { title, tips } = this.props;
        let { scaned } = this.state;
        return (
            <div className="modal-dialog" style={{ width: 400 }}
                ref={(e: HTMLElement) => this.dialogElement = e || this.dialogElement}>
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close"
                            onClick={() => {
                                this.hide();
                            }}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 className="modal-title">{title}</h4>
                    </div>
                    <div className="modal-body form-horizontal">
                        <div className="qrcodeElement" ref={(e: HTMLElement) => this.qrcodeElement = e}>
                            <img style={{ width: '100%' }} ref={(e: HTMLImageElement) => this.img = e || this.img} />

                        </div>

                    </div>
                    <div className="modal-footer" style={{ textAlign: 'center' }}>
                        {scaned ?
                            <h4>
                                <i className="icon-ok text-success" style={{ fontSize: 'larger' }} />
                                <span style={{ paddingLeft: 8 }}>已扫描二维码</span>
                            </h4> :
                            <h4>
                                {tips}
                            </h4>
                        }

                    </div>
                </div>
            </div>
        )
    }

    show(url) {
        this.setUrl(url)
        ui.showDialog(this.dialogContainer);
    }

    hide(){
        ui.hideDialog(this.dialogContainer);
    }

    setUrl(url: string) {
        console.assert(this.qrcodeElement != null);
        let qrcode = new QRCode(this.qrcodeElement.parentElement, { width: 200, height: 200, text: "" });
        let q = qrcode as any;
        q._oDrawing._elImage = this.qrcodeElement.querySelector('img');
        console.log(url);
        qrcode.makeCode(url);
        this.state.scaned = false;
        this.setState(this.state);
    }
}



