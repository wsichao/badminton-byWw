/**
 * 用户账户钱包
 */

const pro_base_url = 'http://localhost:8010';
const test_base_url = 'http://boss_test.mtxhcare.com';
const rp = require('request-promise');

module.exports = {
  /**
   * 获取 BOSS API 基础域名
   * @return url{ String }
   */
  getBaseUrl() {
    if (process.env.NODE_ENV == 'production') {
      return pro_base_url;
    }
    return test_base_url;
  },
  /**
   * 获取请求结果
   * @param {*} url API URL 
   * @param {*} method get,post
   * @param {*} params { 请求参数集 }
   */
  async getRequest(url, method = 'get', params = {}) {
    if (url[0] != '/') {
      throw new Error(`wallet.js --> getRequest --> params --> url 参数不正确，请检查参数。`)
    }
    const base_url = this.getBaseUrl();
    let options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      url: `${base_url}${url}`,
      json: true
    };
   

    if (method == 'get') {
      options.qs = params;
    } else if (method == 'post') {
      options.body = params;
    }
    console.log(options)
    return await rp(options);
  },
  /**
   * 查询用户公益补助金及额度
   * @param {*} user_id 
   * @return 
   * {
   *   status: String; "200"成功/"500"失败
   *   result: {
   *     allCash: Number, 总公益补助金
   *     withdrawCash: Number 可提现额度
   *   }; 
   *   message: String; 反馈信息
   * }
   */
  async apiWalletFind(user_id) {
    const api_url = '/api/wallet/findCash';
    const method = 'post';
    const params = {
      userId: user_id
    }
    return this.getRequest(api_url, method, params);
  },
  /**
   * 用户提成出入账
   * @param {*} user_id 
   * @param {*} cash 金额（正数）
   * @param {*} type Pay出账;Income入账
   * @param {*} sub_type 子类型(Share分享奖励金;NewRegister新用户注册礼)
   * @return 
   * {
   *   status: String; "200"成功/"500"失败
   *   result: String
   *   message: String; 反馈信息
   * }
   */
  async apiWalletChangeBill(user_id, cash = 0, type = "Income", sub_type = "Share", withdrar_id) {
    const api_url = '/api/wallet/changeBill';
    const method = 'post';
    const params = {
      userId: user_id,
      cash,
      type,
      subType: sub_type,
      withdrarId: withdrar_id
    }
    
    return this.getRequest(api_url, method, params);
  },
  /**
   * 获取用户账单明细
   * @param {*} user_id 
   * @return 
   * {
   *   status: String; "200"成功/"500"失败
   *   result: [{
   *      userId: String; 用户Id
   *      type: String; Pay出账;Income入账
   *      subType: string; Share分享奖励金;NewRegister新用户注册礼
   *      cash: number; 金额
   *      createdAt: number; 时间
   *      title: String; 分享奖励金;新用户注册礼
   *      
   *   }]
   *   message: String; 反馈信息
   * }
   */
  async apiWalletUserList(user_id) {
    const api_url = '/api/wallet/userList';
    const method = 'post';
    const params = {
      userId: user_id
    }
    return this.getRequest(api_url, method, params);
  }
}