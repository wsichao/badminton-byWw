/**
 * Created by fly on 2018－01－17.
 */
const AuthBase = require('./AuthBase');
let router_config = undefined;
try {
  router_config = require(path.join(__dirname, '../../src/config/router'))
} catch (e) {

}
/**
 * 
  'im': {
    need_auth: true,
    ignored_url_obj: {
      // '/api/customer/login': true
    }
  }
 */
const config = {
  // 添加IM的整体校验模块
  // 'im': {
  //   need_auth: true,
  //   ignored_url_obj: {}
  // }
}

/**
 * 获取module
 * @param url
 * @returns {*}
 */
function getUrlModule (url) {
  if(url == undefined){
    return undefined
  }
  let url_arr = url.split('/');
  let module = url_arr[1];
  if(!router_config) return module;
  let keys = router_config.keys();
  for(let i = keys.length -1; i > -1; i--){
    let key = keys[i];
    if(url.search(key) === 0) {
      module = router_config[key];
      break;
    }
  }
  if(module === '1') return undefined;
  return module;
}
/**
 * module验证
 * 请求URL,不包含域名与'?'及其后面请求参数部分
 */
class ModuleAuth extends AuthBase {
  constructor(url){
    super(url);
    this.the_module = getUrlModule(this.url);
  }

  needAuth() {
    const url = this.url;
    const the_module = this.the_module;
    console.log('the_module:', the_module);
    const _config = the_module && config[the_module] || undefined;
    if (!_config) return false;

    if(_config.need_auth && !_config.ignored_url_obj[url]){
      return true;
    }else if(!_config.need_auth && !_config.ignored_url_obj[url]){
      return true;
    }
    return false;
  }
}


module.exports = ModuleAuth;