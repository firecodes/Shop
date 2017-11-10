import { Service } from 'userServices/service';
import { userData } from 'userServices/userData';
import { app } from 'application';

let container = document.createElement('div');
container.className = 'admin-pc';
document.body.appendChild(container);

let alertElement = document.createElement('div');
alertElement.className = 'modal fade';
container.appendChild(alertElement);

Service.error.add((sender, err) => {
    switch (err.name) {
        case '600':     //600 为未知异常
        default:
            ui.alert({ title: '错误', message: err.message });
            console.log(err);
            break;
        case '724':     //724 为 token 失效
        case '601':     //601 为用户未登录异常
            if (err.name == '724') {
                userData.userToken.value = '';
            }
            var currentPage = app.currentPage;
            let isLoginPage = currentPage.name == 'user.login';
            if (isLoginPage) {
                return;
            }
            // //========================================================
            // // 1. 如果在打开页面的过程中页面出现未登录，就关掉打开的页面    
            // // 2. 如果是点击按钮的时候出现未登录，就调转登录页面       
            // if ((err.method || 'get') == 'get') {
            //     app.showPage('user_login', { return: currentPage.routeData.routeString });
            //     currentPage.close()
            //     // setTimeout(() => currentPage.close(), 100);
            // }
            // else {
            //     app.redirect('user_login', { return: currentPage.routeData.routeString });
            // }
            //========================================================
            app.redirect('user_login', { return: currentPage.routeData.routeString });
            break;
        case '725':
            ui.alert({ title: '错误', message: 'application-key 配置错误' });
            break;
    }
});