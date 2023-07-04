const co = require('co');
const service = Backend.service('mc_weapp', 'mc_weapp');


module.exports = {
  __rule: function (valid) {
    return valid.object({
      code: valid.string().required()
    });
  },
  getAction() {
    let that = this;
    let code = that.query.code;
    return co(function* () {
      let result = yield service.getSessionKey(code);
      console.log(result);
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
            open_id: result.openid
          }
        });
      }


    })
  }
}