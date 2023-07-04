const co = require('co');
const service = Backend.service('mc_weapp', 'mc_weapp');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      code: valid.string().required(),
      encryptedData: valid.string().required(),
      iv: valid.string().required(),
    });
  },
  postAction() {
    let that = this;
    let code = that.post.code
    let encryptedData = that.post.encryptedData;
    let iv = that.post.iv;

    return co(function* () {
      let result = yield service.getPhoneUser(code, encryptedData, iv);
      if (typeof result == 'string') {
        return that.success({
          code: '1000',
          msg: result
        })
      }else{
        return that.success({
          code: '200',
          msg: '',
          data: result
        });
      }
    });
  }
}