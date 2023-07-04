const mcLiveModel = Backend.model("mc_weapp", undefined, "mc_live");
const rp = require('request-promise');

const appid = 'wxd3f4975292f64d62';
const appsecret = '76a181cd0649120ed49fade49a25124c';

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
   * 获取直播列表 
   * 
   * start: 开始数,
   * limit: 拉取个数
   */
  async getLiveList(start,limit) {
    const api_url = '/wxa/business/getliveinfo?access_token=' + await this.getAccessToken();
    const method = 'post';
    const params = {
        start: start,
        limit: limit
    }
    return this.getRequest(api_url, method, params);
  },
  /**
   * 拉取全部并存表
   */
  async saveLives() {
      let start = 0;
      let poor = 50;
      let lives = [];
      while (poor > 0) {
          let live = await this.getLiveList(start,poor)
          //拉取成功
           if (live.errcode == 0) {
               lives.push(...live.room_info)
                start += poor;
                let total = live.total;
                if (total - start < 50) {
                    poor = total - start
                }
           } else {
               break;
           }
      }
      //存表
    let res = await mcLiveModel.create({roomInfo: lives})
    return res
  }
}