requirejs.config({
    //urlArgs: "bust=5",
    shim: {
        ace: {
            deps: ['jquery', 'bootstrap']
        },
        bootstrap: {
            deps: ['jquery']
        },
        // bootbox: {
        //     deps: ['bootstrap']
        // },
        'maishu-chitu': {
            deps: [
                'polyfill'
            ]
        },
        dilu: {
            exports: 'dilu'
        },
        application: {
            deps: ['maishu-chitu']
        },
        'jquery-ui': {
            exports: 'window["$"]',
            deps: [
                'jquery',
                'css!content/jquery-ui-1.10.0.custom'
            ]
        },
        mobileControls: {
            exports: 'controls',
            deps: ['hammer', 'bezier-easing']
        },
        ui: {
            exports: 'ui'
        },
        userServices: {
            exports: 'userServices'
        },
        um: {
            deps: [
                'jquery',
                'css!../scripts/umeditor/themes/default/css/umeditor.css',
                // '../scripts/umeditor/third-party/template.min',
                'um_config',
            ]
        },
        // um_config: {
        //     deps: [
        //         '../scripts/umeditor/third-party/template.min'
        //     ]
        // },
        um_zh: {
            deps: ['um']
        },
        qrcode: {
            exports: 'QRCode'
        },
        wuzhui: {
            deps: ['jquery']
        }
    },
    paths: {
        ace_editor: '../scripts/ace-builds/src',
        'art-template': '../scripts/template-web',
        bootstrap: '../scripts/bootstrap',
        // chitu: '../scripts/chitu',
        css: '../scripts/css',
        clipboard: '../scripts/clipboard.min',
        dilu: '../scripts/dilu',
        formValidator: '../scripts/formValidator',
        hammer: '../scripts/hammer',
        iscroll: '../scripts/iscroll-lite',
        jquery: '../scripts/jquery-2.1.3',
        react: 'https://cdn.bootcss.com/react/16.0.0/umd/react.development',//'../scripts/react',
        mobileControls: '../scripts/mobileControls',
        move: '../scripts/move',
        text: '../scripts/text',

        polyfill: '../scripts/polyfill',
        polished: '../scripts/polished',

        ui: '../scripts/ui',
        um: '../scripts/umeditor/umeditor',
        um_config: '../scripts/umeditor/umeditor.config',
        um_zh: '../scripts/umeditor/lang/zh-cn/zh-cn',

        knockout: '../scripts/knockout-3.2.0.debug',
        'knockout.validation': '../scripts/knockout.validation',

        'bezier-easing': '../scripts/bezier-easing',
        'jquery.fileupload': '../scripts/jQuery.FileUpload/jquery.fileupload',
        'jquery.validate': '../scripts/jquery.validate',
        'jquery-ui': 'https://cdn.bootcss.com/jqueryui/1.12.1/jquery-ui.min',//'../scripts/jquery-ui',
        'jquery.ui.widget': '../scripts/jquery.ui.widget',
        'qrcode': '../scripts/qrcode',
        'react-dom': 'https://cdn.bootcss.com/react-dom/16.0.0/umd/react-dom.development',//'../scripts/react-dom',
        'prop-types': '../scripts/prop-types',
        'maishu-chitu': '../scripts/chitu',
        'chitu.mobile': '../scripts/chitu.mobile',
        'wuzhui': '../scripts/wuzhui',

        ace: 'assets/js/uncompressed/ace',

        'ue': '../scripts/ueditor',//'http://web.bailunmei.com/ueditor',//
        userServices: '../user/services',
        adminServices: './services',
        componentDesigner: 'modules/station/components/componentDesigner',
        mobilePageDesigner: 'modules/station/components/mobilePageDesigner',
        virtualMobile: 'modules/station/components/virtualMobile',
        'user': '../user',
        'adminComponents': 'controls',
        'share': '../share',
        'admin': './',
        'socket.io': 'http://shopws.bailunmei.com/socket.io/socket.io'
    }
});
// requirejs(['css!content/jquery-ui-1.10.0.custom'])
requirejs(['build'], function () {
    var references = ['react', 'react-dom', 'application', 'art-template'];
    requirejs(references, function (React, ReactDOM, app, ui) {
        window['React'] = React;
        window['ReactDOM'] = ReactDOM;
        window['h'] = React.createElement;

        app.default.run();

    });
})





