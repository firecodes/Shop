define(["require", "exports", 'knockout', 'jquery', 'chitu'], function (require, exports, ko, $, chitu) {
    "use strict";
    exports.config = {
        imageBaseUrl: '',
        storeName: '',
        ajaxTimeoutSeconds: 10
    };
    Number.prototype['toFormattedString'] = function (format) {
        var reg = new RegExp('^C[0-9]+');
        if (reg.test(format)) {
            var num = format.substr(1);
            return this.toFixed(num);
        }
        return this;
    };
    Date.prototype['toFormattedString'] = function (format) {
        switch (format) {
            case 'd':
                return chitu.Utility.format("{0}-{1}-{2}", this.getFullYear(), this.getMonth() + 1, this.getDate());
            case 'g':
                return chitu.Utility.format("{0}-{1}-{2} {3}:{4}", this.getFullYear(), this.getMonth() + 1, this.getDate(), this.getHours(), this.getMinutes());
            case 'G':
                return chitu.Utility.format("{0}-{1}-{2} {3}:{4}:{5}", this.getFullYear(), this.getMonth() + 1, this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds());
            case 't':
                return chitu.Utility.format("{0}:{1}", this.getHours(), this.getMinutes());
            case 'T':
                return chitu.Utility.format("{0}:{1}:{2}", this.getHours(), this.getMinutes(), this.getSeconds());
        }
        return this.toString();
    };
    var formatString = function (useLocale, args) {
        for (var i = 1; i < args.length; i++) {
            args[i] = ko.unwrap(args[i]);
        }
        var result = '';
        var format = args[0];
        for (var i = 0;;) {
            var open = format.indexOf('{', i);
            var close = format.indexOf('}', i);
            if ((open < 0) && (close < 0)) {
                result += format.slice(i);
                break;
            }
            if ((close > 0) && ((close < open) || (open < 0))) {
                if (format.charAt(close + 1) !== '}') {
                    throw new Error('format,Sys.Res.stringFormatBraceMismatch');
                }
                result += format.slice(i, close + 1);
                i = close + 2;
                continue;
            }
            result += format.slice(i, open);
            i = open + 1;
            if (format.charAt(i) === '{') {
                result += '{';
                i++;
                continue;
            }
            if (close < 0)
                throw new Error('format,Sys.Res.stringFormatBraceMismatch');
            var brace = format.substring(i, close);
            var colonIndex = brace.indexOf(':');
            var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10) + 1;
            if (isNaN(argNumber))
                throw new Error('format,Sys.Res.stringFormatInvalid');
            var argFormat = (colonIndex < 0) ? '' : brace.substring(colonIndex + 1);
            var arg = args[argNumber];
            if (typeof (arg) === "undefined" || arg === null) {
                arg = '';
            }
            if (arg.toFormattedString) {
                result += arg.toFormattedString(argFormat);
            }
            else if (useLocale && arg.localeFormat) {
                result += arg.localeFormat(argFormat);
            }
            else if (arg.format) {
                result += arg.format(argFormat);
            }
            else
                result += arg.toString();
            i = close + 1;
        }
        return result;
    };
    var money = function (element, valueAccessor) {
        var str;
        var value = valueAccessor();
        if (value < 0) {
            str = formatString(true, ['-￥{0:C2}', Math.abs(value)]);
        }
        else {
            str = formatString(true, ['￥{0:C2}', value]);
        }
        element.innerHTML = str;
    };
    ko.bindingHandlers['money'] = {
        init: function (element, valueAccessor) {
            money(element, valueAccessor);
        },
        update: function (element, valueAccessor) {
            money(element, valueAccessor);
        }
    };
    var text = function (element, valueAccessor) {
        var value = valueAccessor();
        var str = $.isArray(value) ? formatString(true, value) : ko.unwrap(value);
        element.innerText = str;
    };
    ko.bindingHandlers.text = {
        init: function (element, valueAccessor) {
            return text(element, valueAccessor);
        },
        update: function (element, valueAccessor) {
            return text(element, valueAccessor);
        }
    };
    var href = function (element, valueAccessor) {
        var value = valueAccessor();
        if ($.isArray(value)) {
            var str = formatString(true, value);
            $(element).attr('href', str);
        }
        else {
            $(element).attr('href', value);
        }
    };
    ko.bindingHandlers['href'] = {
        init: function (element, valueAccessor) {
            href(element, valueAccessor);
        },
        update: function (element, valueAccessor) {
            href(element, valueAccessor);
        }
    };
    var ToastDialogHtml = '<div class="modal fade"> \
    <div class="modal-dialog"> \
        <div class="modal-content"> \
            <div class="modal-body"> \
                <h5 data-bind="html:text"></h5> \
            </div> \
        </div> \
    </div> \
</div>';
    var ConfirmDialogHtml = '<div class="modal fade"> \
    <div class="modal-dialog"> \
        <div class="modal-content"> \
            <div class="modal-body"> \
                <h5 data-bind="html:text"></h5> \
            </div> \
            <div class="modal-footer"> \
                <button data-bind="click:cancel" type="button" class="btn btn-default" data-dismiss="modal">取消</button> \
                <button data-bind="click:ok" type="button" class="btn btn-primary">确认</button> \
            </div> \
        </div> \
    </div> \
</div>';
    function getDialogConfig(element, name) {
        var dlg = $(element).attr(name);
        var config;
        if (dlg) {
            config = eval('(function(){return {' + dlg + '};})()');
        }
        else {
            config = {};
        }
        return config;
    }
    function translateClickAccessor(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.unwrap(valueAccessor());
        if (value == null) {
            return valueAccessor;
        }
        return $.proxy(function () {
            var element = this._element;
            var valueAccessor = this._valueAccessor;
            var allBindings = this._allBindings;
            var viewModel = this._viewModel;
            var bindingContext = this._bindingContext;
            var value = this._value;
            return function (viewModel) {
                var deferred = $.Deferred().resolve();
                var dialog_config = getDialogConfig(element, 'data-dialog');
                if (dialog_config.confirm) {
                    var content = dialog_config.confirm;
                    deferred = deferred.pipe(function () {
                        var result = $.Deferred();
                        var html = ConfirmDialogHtml;
                        var node = $(html).appendTo(document.body)['modal']()[0];
                        var model = {
                            text: content,
                            ok: function () {
                                $(node)['modal']('hide');
                                result.resolve();
                            },
                            cancel: function () {
                                result.reject();
                            }
                        };
                        ko.applyBindings(model, node);
                        return result;
                    });
                }
                deferred = deferred.pipe(function () {
                    var result = $.isFunction(value) ? value.apply(viewModel, [viewModel, event]) : value;
                    if (result && $.isFunction(result.always)) {
                        $(element).attr('disabled', 'disabled');
                        $(element).addClass('disabled');
                        result.element = element;
                        result.always(function () {
                            $(element).removeAttr('disabled');
                            $(element).removeClass('disabled');
                        });
                        setTimeout($.proxy(function () {
                            $(this._element).removeAttr('disabled');
                            $(this._element).removeClass('disabled');
                        }, { _element: element }), 1000 * exports.config.ajaxTimeoutSeconds);
                        result.done(function () {
                            if (dialog_config.toast) {
                                var content = dialog_config.toast;
                                var html = ToastDialogHtml;
                                var node = $(html).appendTo(document.body)['modal']()[0];
                                var model = {
                                    text: content
                                };
                                window.setTimeout(function () {
                                    $(node)['modal']('hide');
                                    $(node).remove();
                                }, 1000);
                                ko.applyBindings(model, node);
                            }
                        });
                    }
                    return result;
                });
                return deferred;
            };
        }, {
            _element: element, _valueAccessor: valueAccessor, _allBindings: allBindings,
            _viewModel: viewModel, _bindingContext: bindingContext, _value: value
        });
    }
    var _click = ko.bindingHandlers.click;
    ko.bindingHandlers.click = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            valueAccessor = translateClickAccessor(element, valueAccessor, allBindings, viewModel, bindingContext);
            return _click.init(element, valueAccessor, allBindings, viewModel, bindingContext);
        }
    };
    function getImageUrl(src) {
        if (src.substr(0, 1) == '/') {
            src = exports.config.imageBaseUrl + src;
        }
        return src;
    }
    function getPreviewImage(img_width, img_height) {
        var scale = (img_height / img_width).toFixed(2);
        var img_name = 'img_log' + scale;
        var img_src = localStorage.getItem(img_name);
        if (img_src)
            return img_src;
        var MAX_WIDTH = 320;
        var width = MAX_WIDTH;
        var height = width * new Number(scale).valueOf();
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'whitesmoke';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "Bold 40px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "#999";
        ctx.fillText(exports.config.storeName, canvas.width / 2 - 75, canvas.height / 2);
        img_src = canvas.toDataURL('/png');
        localStorage.setItem(img_name, img_src);
        return img_src;
    }
    var _attr = ko.bindingHandlers.attr;
    ko.bindingHandlers.attr = (function () {
        return {
            'update': function (element, valueAccessor, allBindings) {
                var result = _attr.update(element, valueAccessor, allBindings);
                if (element.tagName == 'IMG') {
                    var value = ko.utils.unwrapObservable(valueAccessor()) || {};
                    ko.utils['objectForEach'](value, function (attrName, attrValue) {
                        var src = ko.unwrap(attrValue);
                        if (attrName == 'src' && src != null) {
                            processImageElement(element);
                            return false;
                        }
                    });
                }
                return result;
            }
        };
    })();
    function processImageElement(element) {
        var PREVIEW_IMAGE_DEFAULT_WIDTH = 200;
        var PREVIEW_IMAGE_DEFAULT_HEIGHT = 200;
        var src = $(element).attr('src');
        $(element).addClass('img-full');
        var img_width = PREVIEW_IMAGE_DEFAULT_WIDTH;
        var img_height = PREVIEW_IMAGE_DEFAULT_HEIGHT;
        var match = src.match(/_\d+_\d+/);
        if (match && match.length > 0) {
            var arr = match[0].split('_');
            img_width = new Number(arr[1]).valueOf();
            img_height = new Number(arr[2]).valueOf();
        }
        $(element).attr('width', img_width + 'px');
        $(element).attr('height', img_height + 'px');
        var src_replace = getPreviewImage(img_width, img_height);
        $(element).attr('src', src_replace);
        var image = new Image();
        image['element'] = element;
        image['updateScrollView'] = match == null || match.length == 0;
        image.onload = function () {
            $(this['element']).attr('src', this.src);
            if (image['updateScrollView'] == true)
                tryUpdateScrollView(this['element']);
        };
        image.src = getImageUrl(src);
    }
    var _html = ko.bindingHandlers.html;
    ko.bindingHandlers.html = {
        'update': function (element, valueAccessor, allBindings) {
            var result = _html.update(element, valueAccessor, allBindings);
            var $img = $(element).find('img');
            $img.each(function () {
                processImageElement(this);
            });
            return result;
        }
    };
    var html_update = ko.bindingHandlers.html.update;
    ko.bindingHandlers.html.update = function (element, valueAccessor, allBindings) {
        var result = html_update.apply(ko.bindingHandlers.html, [element, valueAccessor, allBindings]);
        tryUpdateScrollView(element);
        return result;
    };
    var foreach_update = ko.bindingHandlers.foreach.update;
    ko.bindingHandlers.foreach.update = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        tryUpdateScrollView(element);
        var result = foreach_update.apply(ko.bindingHandlers.foreach, [element, valueAccessor, allBindings, viewModel, bindingContext]);
        return result;
    };
    var visible_update = ko.bindingHandlers.visible.update;
    ko.bindingHandlers.visible.update = function (element, valueAccessor) {
        tryUpdateScrollView(element);
        var result = visible_update.apply(ko.bindingHandlers.visible, [element, valueAccessor]);
        return result;
    };
    function tryUpdateScrollView(element) {
        if (element == null)
            new Error('Argument element is null.');
        var $scroll_view = $(element).parents('scroll-view');
        if ($scroll_view.length > 0) {
            var scroll_view = $scroll_view.data('control');
            if (scroll_view instanceof chitu.IScrollView) {
                refreshScrollView(scroll_view);
            }
        }
    }
    function refreshScrollView(scroll_view) {
        var timeid = $(scroll_view.element).data('timeid');
        if (timeid != null) {
            window.clearTimeout(timeid);
        }
        timeid = window.setTimeout(function () {
            scroll_view.refresh();
        }, 60);
        $(scroll_view.element).data('timeid', timeid);
    }
    ko.bindingHandlers['tap'] = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            valueAccessor = translateClickAccessor(element, valueAccessor, allBindings, viewModel, bindingContext);
            $(element).on("tap", $.proxy(function (event) {
                this._valueAccessor()(viewModel, event);
            }, { _valueAccessor: valueAccessor }));
        }
    };
});
