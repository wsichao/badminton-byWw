const UrlAuth = require('./UrlAuth');
const ModuleAuth = require('./ModuleAuth');
/**
 * 验证入口
 * @param url
 * @param method
 * @returns {boolean}
 */
function needAuth(url, method) {
  console.log(url, method);
  url = url && url.indexOf('?') > -1 ? url.substring(0, url.indexOf('?')) : url;
  method = method && method.toLowerCase() || '';
  let _needAuth = false;
  let url_auth = new UrlAuth(url);
  let module_auth = new ModuleAuth(url);
  const auth_list = [url_auth,module_auth];
  for (let i = 0; i < auth_list.length; i++) {
    _needAuth = auth_list[i].needAuth(method);
    console.log('_needAuth:', _needAuth);
    if (_needAuth) break;
  }
  url_auth = null;
  module_auth = null;
  return _needAuth;
}
module.exports = {
  needAuth: needAuth
}
