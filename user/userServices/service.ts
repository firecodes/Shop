
let userToken = new chitu.ValueStore<string>();
userToken.value = localStorage.getItem('userToken');
export let tokens = {
    get appToken() {
        let search = location.search;
        console.assert(search != null, 'search cannt null.');
        let value = search.substr(1);
        return value;
    },
    get userToken(): chitu.ValueStore<string> {
        return userToken;
    }
}

const REMOTE_HOST = 'service.alinq.cn';
export let config = {
    service: {
        host: REMOTE_HOST,
        shop: `UserShop/`,
        site: `UserSite/`,
        member: `UserMember/`,
        weixin: `UserWeiXin/`,
        account: `UserAccount/`,
    },
    /** 调用服务接口超时时间，单位为秒 */
    ajaxTimeout: 30,
    pageSize: 10
}

let protocol = location.protocol;
let allServiceHosts = [`${protocol}//service.alinq.cn/`, `${protocol}//service1.alinq.cn/`, `${protocol}//service4.alinq.cn/`];
function serviceHost(): Promise<string> {
    let serviceHost = sessionStorage['serviceHost'];
    if (serviceHost)
        return Promise.resolve(serviceHost);

    let promise = new Promise<string>((resolve, reject) => {
        let result: string;
        for (let i = 0; i < allServiceHosts.length; i++) {
            hostPing(allServiceHosts[i]).then(o => {
                console.log(`ping: ${allServiceHosts[i]} ${o}`);

                if (!result) {
                    result = allServiceHosts[i];
                    resolve(result);
                }
            });
        }
    });

    promise.then((host) => {
        sessionStorage['serviceHost'] = host;
    })

    return promise;
}

function hostPing(host: string): Promise<number> {
    var p = new Ping({ favicon: 'UserShop/Home/Index' });

    function ping(host): Promise<number> {
        return new Promise((resolve, reject) => {
            p.ping(host, (err: object, ping: number) => {
                resolve(ping);
            });
        })
    }

    return Promise.all([ping(host), ping(host), ping(host)]).then((arr) => {
        let num = (arr[0] + arr[1] + arr[2]) / 3;
        return num;
    });
}


export abstract class Service extends chitu.Service {
    async ajax<T>(url: string, options: RequestInit) {

        let urlBase = await serviceHost();
        url = `${urlBase}` + url;


        options = options || {};
        options.headers = options.headers;

        options.headers['application-key'] = tokens.appToken;
        if (tokens.userToken.value)
            options.headers['user-token'] = tokens.userToken.value;

        return super.ajax<T>(url, options);
    }
    get<T>(url: string, data?: any): Promise<T> {
        return super.getByJson(url, data);
    }
    post<T>(url: string, data?: any): Promise<T> {
        return super.postByJson(url, data);
    }
    put<T>(url: string, data?: any): Promise<T> {
        return super.putByJson(url, data);
    }
    delete<T>(url: string, data?: any): Promise<T> {
        return super.deleteByJson(url, data);
    }
}

export function imageUrl(path: string, width?: number) {
    if (!path) return path;

    let HTTP = 'http://'
    if (path.startsWith(HTTP)) {
        path = path.substr(HTTP.length);
        let index = path.indexOf('/');
        console.assert(index > 0);
        path = path.substr(index);
    }
    else if (path[0] != '/') {
        path = '/' + path;
    }

    let url = 'https://image.alinq.cn' + path;
    if (width) {
        url = url + '?width=' + width;
    }
    return url;
}

export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}