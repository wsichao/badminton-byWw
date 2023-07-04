const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const userMode = Backend.model('common', undefined, 'customer');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      phone_num: valid.string().max(11).empty('').required(),
      name: valid.string().max(50).empty('').required(),
      volunteers_phone: valid.string().max(11).empty('')
    });
  },
  async updateUserInfo(user_id, phone_num, name) {
    await mcUserInfoModel.update({
      userId: user_id,
      isDeleted: false
    }, {
      "consultingObj.name": name,
      "consultingObj.phoneNum": phone_num
    });
  },
  async getPhoneUserId(phone_num) {
    return await userMode.findOne({
      phoneNum: phone_num,
      isDeleted: false
    }, "_id")
  },
  async updateUser(user_id, volunteers_user_id) {
    await mcUserInfoModel.update({
      userId: user_id,
      isDeleted: false
    }, {
      volunteersUserId: volunteers_user_id,
      volunteersUserTime: Date.now()
    });
  },
  async postAction() {
    const user_id = this.req.identity.userId;
    const phone_num = this.post.phone_num;
    const name = this.post.name;
    const volunteers_phone = this.post.volunteers_phone;

    await this.updateUserInfo(user_id, phone_num, name);

    if (volunteers_phone) {
      const volunteers_user = await this.getPhoneUserId(volunteers_phone);
      if (!volunteers_user) {
        return this.success({
          code: "1000",
          msg: "志愿者手机号不存在，请核实后重新提交"
        })
      }
      if (user_id == volunteers_user._id) {
        return this.success({
          code: "1000",
          msg: "不能设置自己为自己的志愿者"
        })
      }
      await this.updateUser(user_id, volunteers_user._id);
    }
    return this.success({
      code: "200",
      msg: ""
    })
  }
}