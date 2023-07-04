/**
 *
 * 朱李叶健康 医生端小程序-用户登录
 *
 */

'user strict';

const user_service = Backend.service('doctor_weapp', 'user');
const common_async = Backend.service('common', 'common_async');
const doctor_agreement_model = Backend.model('doctor_weapp', undefined, 'doctor_agreement');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      phone_num: valid.string().required(),
      password: valid.string().required(),
    });
  },
  async postAction() {
    const post = this.post;
    let [err, data] = await common_async.awaitWrap(user_service.login(post.phone_num, post.password))
    if (err) {
      return this.success(err);
    } else {
      let result = {
        code: '200',
        msg: '',
        data
      }
      const count = await doctor_agreement_model.count({
        userId: data._id,
        isDeleted: false
      })

      if (count > 0) {
        result.data.isAgreement = true;
      } else {
        result.data.isAgreement = false;
      }

      return this.success(result);
    }

  }
}