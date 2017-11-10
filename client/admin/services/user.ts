import { default as Service } from 'admin/services/service';

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

export interface RegisterModel {
    user: { mobile: string, password: string },
    smsId: string,
    verifyCode: string
}

export interface Application {
    _id: string,
    name: string,
    token: string,
}


export class UserService extends Service {
    private url(path: string) {
        let url = `https://${Service.config.serviceHost}/${path}`;
        return url;
    }
    login(username, password) {
        let url = `https://${Service.config.serviceHost}/admin/login`;
        return this.get<{ token: string, userId: string, appToken: string }>(url, { username, password }).then((o) => {
            Service.token = o.token;
            Service.userId = o.userId;
            Service.username.value = username;
            // Service.appToken = o.appToken;
        })
    }
    async register(model: RegisterModel) {
        (model.user as any).group = 'owner';
        let url = `https://${Service.config.serviceHost}/admin/register`;
        return this.postByJson<{ token: string, userId: string, appToken: string }>(url, model)
            .then((result) => {
                // Service.appToken = result.appToken;
                Service.token = result.token;
                Service.userId = result.userId;
            });
    }
    private createApplication() {
        let url = `https://${Service.config.serviceHost}/application/add`;
        return this.postByJson<{ token: string }>(url, { name: guid() });
    }
    isMobileRegister(mobile: string) {
        let url = `https://${Service.config.serviceHost}/admin/isMobileRegister`;
        return this.get<boolean>(url, { mobile });
    }
    sendVerifyCode(mobile: string) {
        let url = `https://${Service.config.serviceHost}/sms/sendVerifyCode`;
        return this.putByJson<{ smsId: string }>(url, { mobile, type: 'register' });
    }
    applications(): Promise<Array<Application>> {
        // let url = this.url(`application/list`);
        let url = this.url('admin/applications')
        return this.get<Application[]>(url);
    }
    addApplication(app: Application) {
        let url = this.url('admin/addApplication');
        return this.postByJson(url, { app }).then(data => {
            Object.assign(app, data);
            return data;
        });
    }
    updateApplication(app: Application) {
        let url = this.url('application/update');
        return this.putByJson(url, { app });
    }
    deleteApplication(app: Application) {
        console.assert(app != null)
        let url = this.url('admin/deleteApplication');
        return this.deleteByJson(url, { appId: app._id });
    }
    recharge(userId: string, amount: number):Promise<{Balance:number}> {
        let url = Service.config.accountUrl + 'Account/Recharge';
        return this.putByJson(url, { userId, amount });
    }
    async members(args: wuzhui.DataSourceSelectArguments) {

        let membersResult = await this.get<wuzhui.DataSourceSelectResult<UserInfo>>(
            Service.config.memberUrl + 'Member/List',
            args
        );

        let members = membersResult.dataItems;
        let ids = members.map(o => o.Id);
        let memberBalances = await this.get<Array<{ MemberId: string, Balance: number }>>(
            Service.config.accountUrl + 'Account/GetAccountBalances',
            { userIds: ids.join(',') }
        );

        for (let i = 0; i < members.length; i++) {
            members[i].Balance = (memberBalances.filter(o => o.MemberId == members[i].Id)[0] || { Balance: 0 } as UserInfo).Balance;
        }

        return members;
    }


}

export default new UserService();