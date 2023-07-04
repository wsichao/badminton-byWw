
/**
 * 请求url是否需要验证id和token
 * 1.url验证,分get与非get请求两大类
 * 2.module验证
 * 3.扩展...
 * Created by fly on 2018－01－12.
 */

/**
 * 验证基类
 */
class AuthBase {
  constructor(url){
    this.url = url;
  }
  /**
   * 是否需要验证id和token
   * @param url 请求URL,不包含域名与'?'及其后面请求参数部分
   */
  needAuth(url){

  }
}

module.exports = AuthBase;