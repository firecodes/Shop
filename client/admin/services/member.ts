import { default as Service } from 'admin/services/service';
import { userInfo } from 'user/services/memberService';
// import { LoginResult } from 'adminServices/weixin';

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}



let { protocol } = location;
export class MemberService extends Service {
    private url(path: string) {
        let url = `${protocol}//${Service.config.serviceHost}/${path}`;
        return url;
    }
    login(username: string, password: string) {
        let url = `${Service.config.memberUrl}Seller/Login`;
        return this.postByJson<LoginResult>(url, { username, password })
            .then(d => {
                Service.token.value = d.token;
            });
    }
    async register(model: RegisterModel) {
        let url = `${Service.config.memberUrl}Seller/Register`;
        let result = await this.postByJson<{ token: string, userId: string, appToken: string }>(url, model)
        Service.token.value = result.token;
        return result;
    }
    async registerById(sellerId: string) {
        console.assert(sellerId != null);
        let url = `${Service.config.memberUrl}Seller/RegisterById`;
        let result = await this.postByJson<LoginResult>(url, { sellerId });
        Service.token.value = result.token;
        return result;
    }
    async resetPassword(model: RegisterModel) {
        let url = `${Service.config.memberUrl}Seller/resetPassword`;
        let result = await this.postByJson<{ token: string, userId: string, appToken: string }>(url, model)
        Service.token.value = result.token;
        return result;
    }
    private createApplication() {
        let url = `${protocol}//${Service.config.serviceHost}/application/add`;
        return this.postByJson<{ token: string }>(url, { name: guid() });
    }
    isMobileRegister(mobile: string) {
        let url = `${Service.config.memberUrl}Seller/IsRegister`;
        debugger;
        return this.get<boolean>(url, { username: mobile });
    }
    sendVerifyCode(mobile: string) {
        let url = `${Service.config.memberUrl}Seller/SendVerifyCode`;
        return this.postByJson<{ SmsId: string }>(url, { mobile, type: 'Register' });
    }
    stores(): Promise<Array<Store>> {
        let url = `${Service.config.memberUrl}Seller/GetApplications`;
        return this.get<Store[]>(url);
    }
    addStore(app: Store) {
        let url = `${Service.config.memberUrl}Seller/AddApplication`;
        return this.postByJson(url, { name: app.Name }).then(data => {
            Object.assign(app, data);
            return data;
        });
    }
    updateStore(app: Store) {
        let url = `${Service.config.memberUrl}Seller/UpdateApplication`;
        return this.putByJson(url, { app });
    }
    deleteStore(app: Store) {
        console.assert(app != null)
        let url = `${Service.config.memberUrl}Seller/DeleteApplication`;
        return this.deleteByJson(url, { applicationId: app.Id });
    }
    //============================================================
    // 店铺
    saveStore(store: Store) {
        let url = `${Service.config.memberUrl}Seller/UpdateApplication`
        return this.postByJson(url, { app: store });
    }
    async store() {
        let url = `${Service.config.memberUrl}Seller/GetApplication`; //this.url('Store/Get');
        let app = await this.getByJson<Store>(url);
        app.Data = app.Data || {} as any;
        return app;
    }
    //============================================================
    recharge(userId: string, amount: number): Promise<{ Balance: number }> {
        let url = Service.config.accountUrl + 'Account/Recharge';
        return this.putByJson(url, { userId, amount });
    }
    async members(args: wuzhui.DataSourceSelectArguments) {

        let url = `${Service.config.memberUrl}Member/List`;
        let users = await this.getByJson<wuzhui.DataSourceSelectResult<UserInfo>>(url, args);
        let userIds = users.dataItems.map(o => o.Id)
        let url1 = `${Service.config.accountUrl}Account/GetAccountBalances`;
        let accounts = await this.getByJson<Account[]>(url1, { userIds });
        for (let i = 0; i < users.dataItems.length; i++) {
            let account = accounts[i];
            if (account == null)
                continue;

            users.dataItems[i].Balance = account.Balance;
        }

        return users;
    }
    me(): Promise<Seller> {
        let url = `${Service.config.memberUrl}Seller/Me`;

        let url1 = `${Service.config.weixinUrl}Member/GetSeller`;
        return Promise.all([this.get<Seller>(url), this.get<{ OpenId }>(url1)]).then(args => {
            args[1] = args[1] || {} as any;
            args[0].OpenId = args[1].OpenId;
            return args[0];
        })
    }
    // weixinBind(openId: string) {
    //     let url = `${Service.config.memberUrl}Seller/Bind`;
    //     return this.put(url, { openId });
    // }
    // weixinUnbind(openId: string) {
    //     let url = `${Service.config.memberUrl}Seller/Unbind`;
    //     return this.put(url, { openId });
    // }
}

// export default new UserService();