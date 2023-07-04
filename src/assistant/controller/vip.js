const co = require('co');
const user_model = Backend.model('common', undefined, 'customer');
const vip_member = Backend.model('service_package', undefined, 'vip_member');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      phone: valid.string().required()
    });
  },
  getAction() {
    let that = this;
    let phone = that.query.phone;
    return co(function* () {
      let user = yield user_model.findOne({
        phoneNum: phone,
        isDeleted: false
      }, '_id phoneNum name');

      if (user) {
        let count = yield vip_member.count({ userId: user._id, isDeleted: false });
        let msg = '';
        if (count > 0) {
          msg = '该用户已是会员';
        } else {
          yield vip_member.create({
            userId: user._id
          })
          msg = '该用户已升级为会员'
        }
        return that.success({ log: `${user.phoneNum}  ${user.name}  ${msg}` });
      } else {

        return that.success({ log: `${phone}  该用户不存在` });
      }
    })
  }
}