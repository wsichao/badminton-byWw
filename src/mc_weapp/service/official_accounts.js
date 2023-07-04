const mcOfficialAccountModel = Backend.model('mc_weapp', undefined, 'mc_official_accounts');
const _ = require("underscore");
const rp = require('request-promise');

const appid = 'wxeb38691f1f869187';
const appsecret = 'eb764b98e87d31cb5180b3f2a6c389c9';

module.exports = {
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
    const base_url = "https://api.weixin.qq.com";
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
    return await rp(options);
  },
  /**
   * 获取公众号的 accessToken
   */
  async getAccessToken() {
    const api_url = '/cgi-bin/token';
    const method = 'get';
    const params = {
        grant_type: "client_credential",
        appid: appid,
        secret: appsecret
    }
    let data = await this.getRequest(api_url, method, params);
    if (data.access_token) {
        return data.access_token
    }
  },
  /**
   * 获取公众号的 所有关注 openid 数组
   */
  async getAllOpenId(next_openid) {
    const api_url = '/cgi-bin/user/get';
    const method = 'get';
    const params = {
        access_token: await this.getAccessToken(),
        next_openid: next_openid
    }
    return this.getRequest(api_url, method, params);
  },
  /**
   * 获取公众号 根据 openid 获取用户详情
   */
  async getUserInfo(openid) {
    const api_url = '/cgi-bin/user/info';
    const method = 'get';
    const params = {
        access_token: await this.getAccessToken(),
        openid: openid,
        lang:"zh_CN"
    }
    return this.getRequest(api_url, method, params);  
  },
   /**
   * 获取公众号 批量获取用户详情
   */
  async getBatchUserInfo(userList) {
    let access_token = await this.getAccessToken()
    const api_url = "/cgi-bin/user/info/batchget?access_token="+ access_token;
    const method = 'post';
    const params = {
        user_list: userList
    }
    return this.getRequest(api_url, method, params);  
  },
  /**
   * 
   * 更新本地表 和 公共号 用户 同步
   */
  async syncBatchUer() {
     //如果没有 去补充表 
     let openids = []
     //拉取 openid 数组 直到 返回的next_openid 在返回的数组里
     let next_openid = ""
     while (openids.indexOf(next_openid) < 0) {
         let res = await this.getAllOpenId(next_openid)
         openids = openids.concat(res.data.openid)
         next_openid = res.next_openid
     }
     //对比表中的 openid 和 拿到的 openid 数组 看哪些没有对应 unionid
     let group = {
         "_id": "1",
         "total": {$push: "$openid"}
     }
     
     let old = await mcOfficialAccountModel.aggregate(
         {'$group': group}).exec()
     let old_openids = []    
         if (old.length > 0) {
             old_openids = old[0].total 
         }
     let new_openids = openids.filter(function(v){ return old_openids.indexOf(v) == -1 })
     //获取对应的 unionid 然后查表
     let insert = []
     let count = Math.floor(new_openids.length/100)
     for (let i = 0; i < count + 1; i++) {
         let openid = new_openids.slice(i*100,(i+1)*100);
         openid = openid.map(function(op){
             return {
                 openid: op
             }
         })
         let info = await this.getBatchUserInfo(openid);
         let new_list = info.user_info_list
         new_list = new_list.map(function(info){
             return {
                 openid: info.openid,
                 unionid: info.unionid
             }
         })
        
         insert = insert.concat(new_list)
     }
         await mcOfficialAccountModel.create(insert)
     return insert
  },
  /**
   * 传入 unionid 找到对应的 公众号 openid
   */
  async getOpenId(unionid) {
    //到表里查看 是否有 unionid 有了直接返回
    let result = await mcOfficialAccountModel.findOne({unionid:unionid})
    if (result) {
        return result.openid
    }
    await this.syncBatchUer()
    let next = await mcOfficialAccountModel.findOne({unionid:unionid})
    if (next) {
        return next.openid
    }
  },
  /**
   * 推送订单模板
   */
  async postOrderTemplate(orderName,unionid,orderId,price,createAt,remark) {
    let openid = await this.getOpenId(unionid)
    let access_token = await this.getAccessToken()
    const api_url = "/cgi-bin/message/template/send?access_token="+ access_token;
    const method = "post";
    const params = {
        touser: openid,
        template_id: "Cayaa07En1dMLT0JwO3K05u4HcjObZbGD5OuW2WesU0",
        miniprogram:{
            appid:"wxd3f4975292f64d62"
        },
        data:{
            first:{
                value: orderName.length > 0 ? orderName + "有一个新订单" : "有一个新订单，请及时处理"
            },
            keyword1:{
                value:orderId,
                color:"#173177"
            },
            keyword2: {
                value:price/100 + "元",
                color:"#173177"
            },
            keyword3: {
                value:createAt,
                color:"#173177"
            },
            remark:{
                value:remark,
                color:"#173177"
            }
        }
    }
    return this.getRequest(api_url, method, params);
  }
}