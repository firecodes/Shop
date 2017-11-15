import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { isWeixin } from 'userServices/weiXinService';
import { app } from "user/application";
export { app, config } from 'user/application';
// export app;

export function formatDate(date: Date | string) {
    if (typeof date == 'string')
        return date;

    let d = date as Date;
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours() + 1}:${d.getMinutes()}`;
}


export function subscribe<T>(component: React.Component<any, any>, item: chitu.ValueStore<T>, callback: (value: T) => void) {
    let func = item.add(callback);
    let componentWillUnmount = (component as any).componentWillUnmount as () => void;
    (component as any).componentWillUnmount = function () {
        item.remove(func);
        componentWillUnmount();
    }
}

//============================================================
// ui
export function defaultNavBar(elementPage: chitu.Page, options?: { title?: string, right?: JSX.Element, left?: JSX.Element }) {

    if (isWeixin) {
        return weixinNavheader(elementPage, options);
    }

    options = options || {};
    let title = options.title || '';
    let className = elementPage.element.className;
    if (className.indexOf("topbar-padding") < 0)
        elementPage.element.className = className + ' topbar-padding';

    return (
        <nav className="bg-primary">
            <div className="col-xs-3" style={{ padding: 0 }}>
                <button name="back-button" className="left-button" style={{ opacity: 1 }} onClick={() => app.back()}>
                    <i className="icon-chevron-left"></i>
                </button>
                {options.left}
            </div>
            <div className="col-xs-6" style={{ padding: 0 }}>
                <h4>
                    {title}
                </h4>
            </div>
            <div className="col-xs-3" style={{ padding: 0 }}>
                {options.right ? (options.right) : null}
            </div>
        </nav>
    );
}

function weixinNavheader(elementPage: chitu.Page, options?: { title?: string, right?: JSX.Element, left?: JSX.Element }) {
    let title = options.title || "";
    document.title = options.title || "";
    if (options.left == null && options.right == null)
        return null;

    let className = elementPage.element.className;
    if (className.indexOf("topbar-padding") < 0)
        elementPage.element.className = className + ' topbar-padding';

    return (
        <nav className="bg-primary">
            <div className="col-xs-3" style={{ padding: 0 }}>
                <button name="back-button" className="left-button" style={{ opacity: 1 }}>
                    <i className="icon-chevron-left"></i>
                </button>
                {options.left}
            </div>
            <div className="col-xs-6" style={{ padding: 0 }}>
                <h4>
                    {title}
                </h4>
            </div>
            <div className="col-xs-3" style={{ padding: 0 }}>
                {options.right ? (options.right) : null}
            </div>
        </nav>
    );

}


