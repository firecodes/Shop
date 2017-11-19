/** 获取连接速度最快的服务器 */
(function () {
    //====================================================
    // 配置
    let allServiceHosts = [`service.alinq.cn`, `service1.alinq.cn`];//, `service4.alinq.org`
    //====================================================
    let Ping = {
        optimumServer: null as string
    };
    function createPing(opt?: { favicon?: string, timeout?: number }) {

        this.opt = opt || {};
        this.favicon = this.opt.favicon || "/favicon.ico";
        this.timeout = this.opt.timeout || 2000;

        function ping(source: string, callback: (error: string, pong: number) => void) {
            this.img = new Image();
            var timer;

            var start = new Date() as any;
            this.img.onload = pingCheck;
            this.img.onerror = pingCheck;
            if (this.timeout) {
                timer = setTimeout(pingCheck, this.timeout);
            }

            function pingCheck(e) {
                if (timer) {
                    clearTimeout(timer);
                }
                var pong = new Date() as any - start;

                if (typeof callback === "function") {
                    if (e.type === "error") {
                        console.error("error loading resource");
                        return callback("error", pong);
                    }
                    return callback(null, pong);
                }
            }

            let src = opt.favicon.indexOf('?') >= 0 ?
                source + opt.favicon + "&" + (+new Date()) :
                source + opt.favicon + "?" + (+new Date());

            this.img.src = src;
        }

        return {
            ping
        }
    }





    let { protocol } = location;
    for (let i = 0; i < allServiceHosts.length; i++) {
        let url = `${protocol}//${allServiceHosts[i]}/`;
        var p = createPing({ favicon: 'user/index' });
        p.ping(url, (error, pong) => {
            if (!Ping.optimumServer)
                Ping.optimumServer = allServiceHosts[i];
        })
    }



    let urlParams: { code?: string, appKey?: string, state?: string } = {};
    if (location.search)
        urlParams = parseUrlParams(location.search.substr(1));

    function parseUrlParams(query: string) {
        let match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };

        let urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);

        return urlParams;
    }

    /** 微信环境获取用户的 openid */
    (async function check() {
        var ua = navigator.userAgent.toLowerCase();
        let isWeiXin = (ua.match(/MicroMessenger/i) as any) == 'micromessenger';
        if (!isWeiXin)
            return;

        let openid = localStorage.getItem('openid');
        if (openid)
            return;

        if (isWeiXin && openid == null && urlParams.code == null) {
            let setting = await weixinSetting();
            if (setting == null)
                return;

            let appid = setting.AppId;
            let { protocol, pathname, search, hash, host } = location;
            var redirect_uri = `${protocol}//${host}${location.pathname}${search}`;
            var state = hash ? hash.substr(1) : '';

            //======================================
            // host 为 IP，无法使用微信 auth
            if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(host))
                return;
            //======================================

            var url =
                `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`
            location.href = url;
        }
        else if (urlParams.code) {
            let openId = await getOpenId(urlParams.code);
            if (openId != null)
                localStorage.setItem('openid', openId);

            let { protocol, pathname, host } = location;
            let search = `?appKey=${urlParams.appKey}`;
            let hash = `#${urlParams.state}`;
            let u = `${protocol}//${host}${location.pathname}${search}${hash}`

            location.hash = hash;
            history.pushState("", "", u);
        }



        function serviceUrl(path: string) {
            let { protocol } = location;
            let url = `${protocol}//service.alinq.cn/UserWeiXin/${path}?application-key=${urlParams.appKey}`;
            return url;
        }
        async function weixinSetting() {
            let url = serviceUrl('WeiXin/GetConfig')
            let response = await fetch(url);
            return response.json();
        }

        async function getOpenId(code: string) {
            let { protocol } = location;
            let url = serviceUrl('WeiXin/GetOpenId') + `&code=${code}`;
            let response = await fetch(url);
            return response.json();
        }

    })();

    (async function () {
        let { protocol } = location;
        let url = `${protocol}//service.alinq.cn/UserSite/Store/Get?application-key=${urlParams.appKey}`;
        let response = await fetch(url);
        let store = await response.json();
        if (store != null && store.Name != null) {
            document.title = store.Name;
            localStorage.setItem(`${urlParams.appKey}_storeName`, store.Name);
        }

    })();

})();



