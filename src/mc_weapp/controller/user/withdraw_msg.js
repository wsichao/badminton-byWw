
const commonUtil = require('../../../../lib/common-util');
const user_center_service  = Backend.service('user_center','handle_user_center');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      phoneNum: valid.string().required()
    });
  },
  async postAction() {
    const phoneNum = this.post.phoneNum;
    let numCode = await user_center_service.auth_code(phoneNum)
    await commonUtil.sendSms('3172054', phoneNum,
    "#code#=" + numCode.data.code);

    return this.success({
      code: '200',
      msg: ''
    });
  }
}