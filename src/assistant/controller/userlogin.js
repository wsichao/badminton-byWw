const co = require('co');
const user_service = Backend.service('assistant', 'user');
const CommonInfoService = require('./../../../app/services/CommonInfoService');

module.exports = {
  __beforeAction() {
    if (!(this.post.phone_num && (this.post.code || this.post.pwd))) {
      return this.success({
        code: '1000',
        msg: '登录失败，请输入正确的参数'
      })
    }
  },
  __rule: function (valid) {
    return valid.object({
      phone_num: valid.string().required(),
      type: valid.number().default(0),
      code: valid.string(),
      pwd: valid.string()
    });
  },
  postAction() {
    let that = this;
    const userName = this.post.phone_num;
    const pwd = this.post.pwd;
    const type = this.post.type;
    const code = this.post.code;
    return co(function* () {
      let result = null;
      let returnValue = {};
      // 验证码登录
      if (type == 0) {
        result = yield user_service.codeLogin(userName, code);
      }
      // 密码登录
      else if (type == 1) {
        result = yield user_service.pwdLogin(userName, pwd);
      }
      
      if (typeof result != 'string') {
        const token = user_service.getToken(result.user._id, result.user.jkLastestLoginTime);
        returnValue = {
          _id: result.user._id,
          token: token,
          avatar: result.user_info.avatar || '',
          nick_name: result.user_info.name || '',
          phone_num: result.user_info.phoneNum
        }
        returnValue[CommonInfoService.CONS.PARAMS.CDN] = CommonInfoService.getCDN();
        returnValue[CommonInfoService.CONS.PARAMS.ZLY400] = CommonInfoService.get400();
        returnValue[CommonInfoService.CONS.PARAMS.DOC_CHAT_NUM_REG] = CommonInfoService.getDocChatNumRegex();
        return that.success({ code: '200', msg: '', data: returnValue });
      } else {
        return that.success({ code: '1000', msg: result });
      }
    }).catch(function (e) {
      console.log(e);
      return that.success({ code: '1000', 'msg': '登录失败' });
    })
  }
}