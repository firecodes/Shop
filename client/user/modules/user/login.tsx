import { defaultNavBar } from 'site';
import { MemberService } from 'userServices/memberService';
import { app } from 'site';
import { FormValidator, rules } from 'dilu';

export default function (page: chitu.Page) {
    let member = page.createService(MemberService);
    let usernameInput: HTMLInputElement;
    let passwordInput: HTMLInputElement;
    let formElement: HTMLFormElement;

    class UserLoginPage extends React.Component<any, any> {
        private validator: FormValidator;
        async login() {
            let isValid = await this.validator.check();
            if (!isValid)
                return;

            await member.login(usernameInput.value, passwordInput.value);
            app.redirect(returnString);
        }
        componentDidMount() {
            // if (!validator) {
            let { required } = rules;
            this.validator = new FormValidator(
                { element: usernameInput, rules: [required("请输入手机号码")] },
                { element: passwordInput, rules: [required("请输入密码")] }
            )
            // }
        }
        render() {
            return [
                <header key="header">
                    {defaultNavBar(page, { title: "登录" })}
                </header>,
                <section key="view">
                    <form className="form-horizontal container"
                        ref={(e: HTMLFormElement) => formElement = e || formElement}>
                        <div className="form-group">
                            <div className="col-xs-12">
                                <input type="text" name="username" className="form-control" placeholder="手机号码"
                                    ref={(e: HTMLInputElement) => usernameInput = e || usernameInput} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-xs-12">
                                <input type="password" name="password" className="form-control" placeholder="密码"
                                    ref={(e: HTMLInputElement) => passwordInput = e || passwordInput} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-xs-12">
                                <button id="Login" type="button" className="btn btn-primary btn-block"
                                    ref={(e: HTMLButtonElement) => {
                                        if (!e) return;
                                        e.onclick = ui.buttonOnClick(() => this.login());
                                    }}>立即登录</button>
                            </div>
                            <div className="col-xs-12 text-center" style={{ marginTop: 10 }}>
                                <a href="#user_register" className="pull-left">我要注册</a>
                                <a href="#user_resetPassword" className="pull-right">忘记密码</a>
                            </div>
                        </div>
                    </form>
                </section>
            ];
        }
    }

    let returnString = page.routeData.values.reutrn || 'user_index';

    ReactDOM.render(<UserLoginPage />, page.element);
}