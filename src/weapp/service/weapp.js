const appId = 'wx399814b31170f329';
const secret = '05b9d2bbc76d98af7da18e40f928d378';
const WXBizDataCrypt = require('./WXBizDataCrypt');
const request = require('request');
const co = require('co');

module.exports = {
  getPhoneNumber: function (sessionKey, encryptedData, iv) {
    let pc = new WXBizDataCrypt(appId, sessionKey)
    let data = '';
    try {
      data = pc.decryptData(encryptedData, iv);
    } catch (e) {
      data = '用户授权失败，请刷新页面重新授权';
    }
    return data;
  },
  getSessionKey(code) {
    let deferred = Backend.Deferred.defer();
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        deferred.resolve(JSON.parse(body));
      }
    })
    return deferred.promise;
  },
  getPhoneUser(code, encryptedData, iv) {
    let that = this;
    return co(function* () {
      let jscode2session = yield that.getSessionKey(code);
      if (jscode2session.errcode == 40029) {
        return "code已过期，请重新生成";
      }
      let sessionKey = jscode2session.session_key;
      if(!sessionKey){
        return 'code已过期，请重新生成';
      }
      let p = that.getPhoneNumber(sessionKey, encryptedData, iv);
      return p
    })
  }
}