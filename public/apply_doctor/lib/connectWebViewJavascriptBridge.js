/**
 * webviewBridge
 * Created by menzhongxin on 16/3/31.
 */

var webViewBridge = function(){

  /**
   * ios init
   * @param callback
   * @private
   * */
  var _iosConnectWebViewJavascriptBridge = function(callback){
    if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
  };

  /**
   * android init
   * @param callback
   * @private
   */
  var _androidConnectWebViewJavascriptBridge = function(callback){
    if (window.WebViewJavascriptBridge) {
      callback(WebViewJavascriptBridge);
    } else {
      document.addEventListener('WebViewJavascriptBridgeReady', function() {
        callback(WebViewJavascriptBridge);
        WebViewJavascriptBridge.init(function(message, responseCallback) {
          var data = {
          };
          responseCallback(data);
        });
      }, false);
    }
  };

  /**
   * WebViewBridge init
   */
  var _init = function(callback){
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if(isAndroid)
      _androidConnectWebViewJavascriptBridge(callback);
    if(isiOS)
      _iosConnectWebViewJavascriptBridge(callback);
  };

  var fn = function(){};

  /**
   * 初始化bridge
   * @param callback
   */
  fn.prototype.bridgeInit = function(callback){
    _init(callback);
  };

  /**
   * Register App Native Method
   * 提示信息
   * data = {title:'警告',msg:'信息不完整!'}
   * @param msg
   */
  fn.prototype.alert = function(msg){
    WebViewJavascriptBridge.callHandler('alert',msg,function(response){
    });
  };

  /**
   * Register App Native Method
   * 上传图片
   * @param fnName
   * @param data
   */
  fn.prototype.upload = function(fnName,data){
    fnName = fnName || 'uploadImg';
    data = data || 1;
    WebViewJavascriptBridge.callHandler(fnName, data, function(response) {
    });
  };


  return new fn();
};





