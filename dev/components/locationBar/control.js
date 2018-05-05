define(["require", "exports", "components/common", "user/application", "user/siteMap"], function (require, exports, common_1, application_1, siteMap_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LocationBarControl extends common_1.Control {
        get persistentMembers() {
            return [];
        }
        _render(h) {
            /**
             * 要在控件设置和控件大小相关的样式，例如 padding，margin，height
             */
            return (h("div", { className: "locationBar", style: { padding: 14 } },
                h("i", { className: "icon-user pull-right", onClick: () => application_1.app.redirect(siteMap_1.default.nodes.user_index) }),
                h("div", { className: "position interception" },
                    h("i", { className: "icon-map-marker" }),
                    h("span", null, "\u6682\u65F6\u83B7\u53D6\u4E0D\u5230\u4F4D\u7F6E\u4FE1\u606F"),
                    h("i", { className: "icon-sort-down", style: { margin: 0, position: 'relative', left: 6, top: -2 } }))));
        }
    }
    exports.default = LocationBarControl;
});
