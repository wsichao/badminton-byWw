const co = require('co');
const service = Backend.service('mc_weapp', 'mc_weapp');
const mc_userinfo_model = Backend.model("mc_weapp", undefined, "mc_user_info");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      code: valid.string().required(),
      user_id: valid.string().required()
    });
  },
  async getAction() {
    let that = this;
    let code = that.query.code;
    let user_id = that.query.user_id;

    return co(function* () {
      let result = yield service.getSessionKey(code);
      //result 返回了 unionid 证明已经关注了公共号
      //如果有 unionid 就去绑定给 我们的 user 同时绑定openid
      if (result.unionid) { 
        yield mc_userinfo_model.update({ "userId": user_id },{
            openid: result.openid,
            unionid: result.unionid
        })
      }
      if (result.errcode == 40029) {
        return that.success({
          code: '1000',
          msg: 'code已失效，请重新获取'
        });
      } else {
        return that.success({
          code: '200',
          msg: '',
          data: {
            union_status: result.unionid ? true : false
          }
        });
      }
    })
  }
}