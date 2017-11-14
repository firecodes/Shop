/** @license React v16.1.1
 * react.production.min.js
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';(function(p,l){"object"===typeof exports&&"undefined"!==typeof module?module.exports=l():"function"===typeof define&&define.amd?define(l):p.React=l()})(this,function(){function p(a){for(var b=arguments.length-1,c="Minified React error #"+a+"; visit http://facebook.github.io/react/docs/error-decoder.html?invariant\x3d"+a,e=0;e<b;e++)c+="\x26args[]\x3d"+encodeURIComponent(arguments[e+1]);b=Error(c+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings.");
b.name="Invariant Violation";b.framesToPop=1;throw b;}function l(a){return function(){return a}}function n(a,b,c){this.props=a;this.context=b;this.refs=v;this.updater=c||w}function x(a,b,c){this.props=a;this.context=b;this.refs=v;this.updater=c||w}function y(){}function z(a,b,c){this.props=a;this.context=b;this.refs=v;this.updater=c||w}function F(a,b,c){var e,f={},d=null,h=null;if(null!=b)for(e in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(d=""+b.key),b)G.call(b,e)&&!H.hasOwnProperty(e)&&(f[e]=b[e]);
var g=arguments.length-2;if(1===g)f.children=c;else if(1<g){for(var k=Array(g),m=0;m<g;m++)k[m]=arguments[m+2];f.children=k}if(a&&a.defaultProps)for(e in g=a.defaultProps,g)void 0===f[e]&&(f[e]=g[e]);return{$$typeof:r,type:a,key:d,ref:h,props:f,_owner:A.current}}function B(a){return"object"===typeof a&&null!==a&&a.$$typeof===r}function O(a){var b={"\x3d":"\x3d0",":":"\x3d2"};return"$"+(""+a).replace(/[=:]/g,function(a){return b[a]})}function I(a,b,c,e){if(t.length){var f=t.pop();f.result=a;f.keyPrefix=
b;f.func=c;f.context=e;f.count=0;return f}return{result:a,keyPrefix:b,func:c,context:e,count:0}}function J(a){a.result=null;a.keyPrefix=null;a.func=null;a.context=null;a.count=0;10>t.length&&t.push(a)}function q(a,b,c,e){var f=typeof a;if("undefined"===f||"boolean"===f)a=null;if(null===a||"string"===f||"number"===f||"object"===f&&a.$$typeof===P||"object"===f&&a.$$typeof===Q)return c(e,a,""===b?"."+C(a,0):b),1;var d=0;b=""===b?".":b+":";if(Array.isArray(a))for(var h=0;h<a.length;h++){f=a[h];var g=
b+C(f,h);d+=q(f,g,c,e)}else if(g=K&&a[K]||a["@@iterator"],"function"===typeof g)for(a=g.call(a),h=0;!(f=a.next()).done;)f=f.value,g=b+C(f,h++),d+=q(f,g,c,e);else"object"===f&&(c=""+a,p("31","[object Object]"===c?"object with keys {"+Object.keys(a).join(", ")+"}":c,""));return d}function C(a,b){return"object"===typeof a&&null!==a&&null!=a.key?O(a.key):b.toString(36)}function R(a,b,c){a.func.call(a.context,b,a.count++)}function S(a,b,c){var e=a.result,f=a.keyPrefix;a=a.func.call(a.context,b,a.count++);
Array.isArray(a)?D(a,e,c,E.thatReturnsArgument):null!=a&&(B(a)&&(b=f+(!a.key||b&&b.key===a.key?"":(""+a.key).replace(L,"$\x26/")+"/")+c,a={$$typeof:r,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}),e.push(a))}function D(a,b,c,e,f){var d="";null!=c&&(d=(""+c).replace(L,"$\x26/")+"/");b=I(b,d,e,f);null==a||q(a,"",S,b);J(b)}var M=Object.getOwnPropertySymbols,T=Object.prototype.hasOwnProperty,U=Object.prototype.propertyIsEnumerable,u=function(){try{if(!Object.assign)return!1;var a=new String("abc");
a[5]="de";if("5"===Object.getOwnPropertyNames(a)[0])return!1;var b={};for(a=0;10>a;a++)b["_"+String.fromCharCode(a)]=a;if("0123456789"!==Object.getOwnPropertyNames(b).map(function(a){return b[a]}).join(""))return!1;var c={};"abcdefghijklmnopqrst".split("").forEach(function(a){c[a]=a});return"abcdefghijklmnopqrst"!==Object.keys(Object.assign({},c)).join("")?!1:!0}catch(e){return!1}}()?Object.assign:function(a,b){if(null===a||void 0===a)throw new TypeError("Object.assign cannot be called with null or undefined");
var c=Object(a);for(var e,f=1;f<arguments.length;f++){var d=Object(arguments[f]);for(var h in d)T.call(d,h)&&(c[h]=d[h]);if(M){e=M(d);for(var g=0;g<e.length;g++)U.call(d,e[g])&&(c[e[g]]=d[e[g]])}}return c},v={},d=function(){};d.thatReturns=l;d.thatReturnsFalse=l(!1);d.thatReturnsTrue=l(!0);d.thatReturnsNull=l(null);d.thatReturnsThis=function(){return this};d.thatReturnsArgument=function(a){return a};var E=d,w={isMounted:function(a){return!1},enqueueForceUpdate:function(a,b,c){},enqueueReplaceState:function(a,
b,c,e){},enqueueSetState:function(a,b,c,e){}};n.prototype.isReactComponent={};n.prototype.setState=function(a,b){"object"!==typeof a&&"function"!==typeof a&&null!=a?p("85"):void 0;this.updater.enqueueSetState(this,a,b,"setState")};n.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate")};y.prototype=n.prototype;d=x.prototype=new y;d.constructor=x;u(d,n.prototype);d.isPureReactComponent=!0;d=z.prototype=new y;d.constructor=z;u(d,n.prototype);d.unstable_isAsyncReactComponent=
!0;d.render=function(){return this.props.children};var A={current:null},G=Object.prototype.hasOwnProperty,r="function"===typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103,H={key:!0,ref:!0,__self:!0,__source:!0},K="function"===typeof Symbol&&Symbol.iterator,P="function"===typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103,Q="function"===typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.portal")||60106,L=/\/+/g,t=[];"function"===typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.fragment");
d={Children:{map:function(a,b,c){if(null==a)return a;var e=[];D(a,e,null,b,c);return e},forEach:function(a,b,c){if(null==a)return a;b=I(null,null,b,c);null==a||q(a,"",R,b);J(b)},count:function(a,b){return null==a?0:q(a,"",E.thatReturnsNull,null)},toArray:function(a){var b=[];D(a,b,null,E.thatReturnsArgument);return b},only:function(a){B(a)?void 0:p("143");return a}},Component:n,PureComponent:x,unstable_AsyncComponent:z,createElement:F,cloneElement:function(a,b,c){var e=u({},a.props),d=a.key,l=a.ref,
h=a._owner;if(null!=b){void 0!==b.ref&&(l=b.ref,h=A.current);void 0!==b.key&&(d=""+b.key);if(a.type&&a.type.defaultProps)var g=a.type.defaultProps;for(k in b)G.call(b,k)&&!H.hasOwnProperty(k)&&(e[k]=void 0===b[k]&&void 0!==g?g[k]:b[k])}var k=arguments.length-2;if(1===k)e.children=c;else if(1<k){g=Array(k);for(var m=0;m<k;m++)g[m]=arguments[m+2];e.children=g}return{$$typeof:r,type:a.type,key:d,ref:l,props:e,_owner:h}},createFactory:function(a){var b=F.bind(null,a);b.type=a;return b},isValidElement:B,
version:"16.1.1",__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentOwner:A,assign:u}};var N=Object.freeze({default:d});d=N&&d||N;return d["default"]?d["default"]:d});