const userMode = Backend.model('common', undefined, 'customer');
const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      phone_num: valid.string().max(11).required()
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

    return await userMode.findOne({
      _id: volunteers_user_id,
      isDeleted: false
    }, "name avatar phoneNum")
  },

  async getAction() {
    const user_id = this.req.identity.userId;
    const phone_num = this.query.phone_num;

    const user = await this.getPhoneUserId(phone_num);

    if (!user) {
      return this.success({
        code: "1000",
        msg: "该手机号不存在，请核对后重新输入"
      })
    } else if (user_id == user._id) {
      return this.success({
        code: "1000",
        msg: "不能设置自己为自己的志愿者"
      })
    }

    const result = await this.updateUser(user_id, user._id);

    return this.success({
      code: "200",
      msg: "",
      data: {
        name: result.name,
        avatar: result.avatar,
        phone_num: result.phoneNum
      }
    })
  }
}