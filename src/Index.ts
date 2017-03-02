requirejs.config({
    //urlArgs: "bust=5",
    shim: {
        ace: {
            deps: ['jquery', 'bootstrap']
        },
        bootstrap: {
            deps: ['jquery']
        },
        bootbox: {
            deps: ['bootstrap']
        },
        chitu: {
            deps: ['jquery', 'knockout', 'crossroads']
        },
        custom: {
            deps: ['jquery', 'jquery-ui', 'jquery.cookie', 'JData']
        },
        crossroads: {
            deps: ['jquery']
        },
        knockout: {
            exports: 'ko'
        },
        'ko.ext/knockout.extentions': {
            deps: ['jquery']
        },
        'ko.val': {
            deps: ['knockout.validation'],
            exports: 'ko.validation'
        },
        'ko.map': {
            deps: ['knockout']
        },
        JData: {
            deps: ['MicrosoftAjax.debug', 'jquery-ui']
        },
        'jquery.fileupload': {
            deps: ['scripts/jQuery.FileUpload/jquery.iframe-transport',
                'css!scripts/jQuery.FileUpload/css/jquery.fileupload-ui.css']
        },
        'Site': {
            deps: ['jquery.cookie', 'bootbox']
        },
        'Application': {
            deps: ['chitu']
        }
    },
    paths: {
        ace: 'assets/js/uncompressed/ace',
        bootstrap: 'assets/js/uncompressed/bootstrap',
        bootbox: 'scripts/bootbox',
        chitu: 'scripts/chitu',
        crossroads: 'scripts/crossroads',
        css: 'scripts/css',
        hammer: 'scripts/hammer',
        JData: 'scripts/JData',
        jquery: 'scripts/jquery-2.1.3',
        'jquery.cookie': 'scripts/jquery.cookie',
        'jquery.fileupload': 'scripts/jQuery.FileUpload/jquery.fileupload',
        'jquery.validate': 'scripts/jquery.validate',
        'jquery-ui': 'scripts/jquery-ui',
        'jquery.ui.widget': 'scripts/jquery.ui.widget',
        knockout: 'scripts/knockout-3.2.0',
        'ko.ext': 'common/knockout.extentions',
        'ko.map': 'scripts/knockout.mapping.debug',
        'ko.val': 'scripts/knockout.validation.cn',
        'knockout.validation': 'scripts/knockout.validation',
        'knockout.mapping': 'scripts/knockout.mapping',
        react: 'scripts/react',
        'react-dom': 'scripts/react-dom',
        move: 'scripts/move',
        'MicrosoftAjax.debug': 'scripts/MicrosoftAjax.debug',
        text: 'scripts/text',
        sv: 'services',
        custom: 'Custom',
        mod: 'modules',
        modules: 'modules',
        content: 'content',
        com: 'common',
        //app: 'App',
        'ue': 'ueditor'
    }
});
var references = ['react', 'react-dom', 'knockout', 'ko.map', 'Application', 'Site', 'ErrorHandle', 'custom'];
requirejs(references, function (React, ReactDOM, ko, mapping, app) {
    window['React'] = React;
    window['ReactDOM'] = ReactDOM;
    window['ko'] = ko;
    window['ko'].mapping = mapping;

    app.run()



    requirejs(['ace'], function () { });
});

