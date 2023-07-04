const appId = 'wxd3f4975292f64d62';
const secret = '76a181cd0649120ed49fade49a25124c';
const WXBizDataCrypt = require('../../weapp/service/WXBizDataCrypt');
const request = require('request');
const co = require('co');
const fs = require('fs');
const common_util = require('../../../lib/common-util');

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
      if (!sessionKey) {
        return 'code已过期，请重新生成';
      }
      let p = that.getPhoneNumber(sessionKey, encryptedData, iv);
      return p
    })
  },
  async get_weapp_qr_code(user_id, page) {
    let deferred = Backend.Deferred.defer();
    let accessTokenRes = await this.getAccessToken();
    let user_id_str = user_id;
    let post_url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessTokenRes.access_token}`;
    let option = {
      url: post_url,
      method: "POST",
      json: true,
      header: {
        'Content-Type': "application/json"
      },
      body: {
        scene: user_id_str,
      }
    };
    if (page) {
      option.body.page = page;
    }
    const file_name = common_util.getNewObjectId() + '';
    const path = "down_load_images/" + file_name + ".png";
    const writeStream = fs.createWriteStream(path);
    const readStream = request(option).pipe(writeStream);
    writeStream.on('finish', function () {
      console.log('finish');
      uploadLocalFile(path, file_name, function (err, ret) {
        if (err) {
          console.log(err)
          console.log('上传七牛失败')
        }
        console.log('上传7牛成功');
        deferred.resolve({
          qr_code: file_name
        });
      })
    });
    return deferred.promise;
  },
  async getAccessToken() {
    let deferred = Backend.Deferred.defer();
    let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`;
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        deferred.resolve(JSON.parse(body));
      }
    })
    return deferred.promise;
  },
  async uplodeHeadUrl(url) {
    let deferred = Backend.Deferred.defer();
    const file_name = common_util.getNewObjectId() + '';
    const path = "down_load_images/" + file_name + ".png";
    const writeStream = request(url).pipe(fs.createWriteStream(path));
    writeStream.on('finish', function () {
      console.log('finish');
      uploadLocalFile(path, file_name, function (err, ret) {
        if (err) {
          console.log(err)
          console.log('上传七牛失败')
        }
        console.log('上传7牛成功');
        deferred.resolve({
          head_code: file_name
        });
      })
    });
    return deferred.promise;
  }
}