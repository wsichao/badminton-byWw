/**
 *
 * 用户中心相关操作
 *
 * Created by yichen on 2018/5/9.
 */
const request = require('request');
const co = require('co');
const user_model = require('../../../app/models/Customer');


const host = (process.env.NODE_ENV == "production") ? "http://bc.juliye.net" : 'http://47.95.29.0:8360';
//app_id 和 app_secret 必须在每次请求时都放在请求参数中
const app_id = '9ebb264a-7832-4ba5-89a8-cb5ccff36b09'
const app_secret = 'b77c09ab-6c05-4c33-9539-39299bc36ab7'
const get_fixed_para = '&app_id=' + app_id
  +'&app_secret=' + app_secret;

module.exports = {
  /**
   * 获取验证码
    * @param phone
   */
  auth_code(phone) {
    let defer = Backend.Deferred.defer();
    let url = host + '/user/code/get?phone_num=' + phone + get_fixed_para;
    let opetions = {
      url: url,
      method: "GET",
      json: true,
      headers: {
        "content-type": "application/json",
      }
    }
    request(opetions,function (error, response, data) {
      console.log(data)
      defer.resolve(data);
    });
    return defer.promise
  },
  /**
   * 验证码登陆用户中心
   * @param phone_num
   * @param auth_code
   */
  login_auth_code (phone_num,auth_code){
    let defer = Backend.Deferred.defer();
    let url = host + '/user/code/auth';
    let opetions = {
      url: url,
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: {
        phone_num : phone_num,
        code : auth_code,
        app_id :app_id,
        app_secret:app_secret
      }
    }
    request(opetions, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        defer.resolve(body);
      }
    });
    return defer.promise
  },
  /**
   * 密码登陆用户中心
   * @param phone_num
   * @param pwd
   */
  login_password (phone_num,pwd){
    let defer = Backend.Deferred.defer();
    let url = host + '/user/login/account';
    let opetions = {
      url: url,
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: {
        phone_num : phone_num,
        pwd : pwd,
        app_id :app_id,
        app_secret:app_secret
      }
    }
    request(opetions, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        defer.resolve(body);
      }
    });
    return defer.promise
  },
  /**
   * 第三方登陆用户中心
   * @param type
   * @param openid
   */
  login_third (type,openid){
    switch(type)
    {
      case 'wx':
        type = 'wechat';
        break;
      case 'wb':
        type = 'weibo';
        break;
    }
    let defer = Backend.Deferred.defer();
    let url = host + '/user/login/third';
    let opetions = {
      url: url,
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: {
        type : type,
        openid : openid,
        app_id :app_id,
        app_secret:app_secret
      }
    }
    request(opetions, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        defer.resolve(body);
      }
    });
    return defer.promise
  },
  /**
   * 修改用户密码
   * @param phone_num
   * @param code
   * @param old_pwd
   * @param new_pwd
   */
  reset_password (phone_num,code,old_pwd,new_pwd){
    let defer = Backend.Deferred.defer();
    let url = host + '/user/info/pwd';
    let opetions = {
      url: url,
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: {
        phone_num : phone_num,
        code : code,
        old_pwd:old_pwd,
        new_pwd:new_pwd,
        app_id :app_id,
        app_secret:app_secret
      }
    }
    request(opetions, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        defer.resolve(body);
      }else{
        defer.reject(error);
      }
    });
    return defer.promise
  },
  /**
   * 获取用户信息
   * @param openid
   */
  user_info(openid) {
    let defer = Backend.Deferred.defer();
    let url = host + '/user/info/get?openid=' + openid + get_fixed_para;
    let opetions = {
      url: url,
      method: "GET",
      json: true,
      headers: {
        "content-type": "application/json",
      }
    }
    request(opetions,function (error, response, data) {
      console.log(data)
      defer.resolve(data);
    });
    return defer.promise
  },
  /**
   * 修改用户信息
   * @param openid
   * @param update {name,avatar,wechat,qq,weibo}
   */
  user_info_update (openid,update){
    let defer = Backend.Deferred.defer();
    let url = host + '/user/info/post';
    update.openid =openid;
    update.app_id =app_id;
    update.app_secret =app_secret;
    update.extra_from ='zlycare';
    let opetions = {
      url: url,
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: update
    }
    request(opetions, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        defer.resolve(body);
      }else{
        defer.reject(error);
      }
    });
    return defer.promise
  },
  user_init (user_info){
    let defer = Backend.Deferred.defer();
    let url = host + '/user/info/init';
    user_info.app_id =app_id;
    user_info.app_secret =app_secret;
    user_info.extra_from ='zlycare';
    let opetions = {
      url: url,
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: user_info
    }
    request(opetions, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        defer.resolve(body);
      }
    });
    return defer.promise
  },
  login_lazy_user_init(phoneNum,thirdType,thirdOpenId){
    let that = this;
    let result = co(function* (){
      let user;
      if(phoneNum){
        user = yield user_model.findOne({phoneNum:phoneNum,isDeleted:false});
        console.log(2)
        console.log(user)
      }
      if(thirdType && thirdOpenId){
        let cond = {
          isDeleted:false
        }
        let key = 'thirdParty.'+ thirdType+'.id';
        cond[key] = thirdOpenId
        user = yield user_model.findOne(cond);
      }
      if(user && !user.openId){
        let userInfo = {
          phone_num : user.phoneNum,

          pwd : user.loginPassword || '',

          name : user.name,

          avatar : user.avatar,

          wechat : user.thirdParty && user.thirdParty.wx && user.thirdParty.wx.id || '',

          qq: user.thirdParty && user.thirdParty.qq && user.thirdParty.qq.id || '',

          weibo: user.thirdParty && user.thirdParty.wb && user.thirdParty.wb.id || ''
        }
        let result = yield that.user_init(userInfo);
        if(result && !result.errno && result.data && result.data.id){
          let userRes = yield user_model.findOneAndUpdate({_id:user._id}, {$set: {openId : result.data.id}}, {new: true}).exec();
          if(userRes){
            return userRes
          }
        }
      }else{
        return {}
      }

    })
    return result;
  },
  must_init(user){
    let that = this;
    let result = co(function* (){
      if(user){
        let userInfo = {
          phone_num : user.phoneNum,

          pwd : user.loginPassword || '',

          name : user.name,

          avatar : user.avatar,

          wechat : user.thirdParty && user.thirdParty.wx && user.thirdParty.wx.id || '',

          qq: user.thirdParty && user.thirdParty.qq && user.thirdParty.qq.id || '',

          weibo: user.thirdParty && user.thirdParty.wb && user.thirdParty.wb.id || ''
        }
        let result = yield that.user_init(userInfo);
        if(result && !result.errno && result.data && result.data.id){
          let userRes = yield user_model.findOneAndUpdate({_id:user._id}, {$set: {openId : result.data.id}}, {new: true}).exec();
          if(userRes){
            return userRes
          }
        }
      }else{
        return {}
      }

    })
    return result;
  },
  async init_user_without_pwd(user,pwd){
    let that = this;
    let userInfo = {
      phone_num : user.phoneNum,

      pwd : pwd || '',

      name : user.name,

      avatar : user.avatar,

      wechat : user.thirdParty && user.thirdParty.wx && user.thirdParty.wx.id || '',

      qq: user.thirdParty && user.thirdParty.qq && user.thirdParty.qq.id || '',

      weibo: user.thirdParty && user.thirdParty.wb && user.thirdParty.wb.id || ''
    }
    return  await that.user_init(userInfo);
  }
}