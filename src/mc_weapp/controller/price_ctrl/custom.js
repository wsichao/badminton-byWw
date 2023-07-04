const community_amount_price_service = Backend.service("mc_weapp", "community_amount_price");
const user_model = Backend.model("common", undefined, "customer");
module.exports = {
  __rule: function (valid) {
    return valid.object({
      phone: valid.string().required(),
      type: valid.number().required(),
    });
  },
  async getAction() {
    const phone = this.query.phone;
    const type = this.query.type;
    let log = false;
    const user = await user_model.findOne({
      phoneNum: phone,
      isDeleted: false
    }, "_id");
    const user_id = user._id;
    if (type == 0) {
      await community_amount_price_service.insertLoginUser(user_id);
      log = `${phone}: 用户首次登录+100`;
    } else if (type == 1) {
      await community_amount_price_service.insertShareUser(user_id);
      log = `${phone}: 用户分享+30`;
    }
    return this.success({
      log
    })
  }
}