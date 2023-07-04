const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');

module.exports = {
  async getAction() {
    let user_id = this.req.identity.userId;
    const user_info = await mcUserInfoModel.findOne({
      userId: user_id,
      isDeleted: false
    })
    let name = "";
    let phone = "";
    let address = "";
    if (user_info.recipientInfo) {
      name = user_info.recipientInfo.name;
      phone = user_info.recipientInfo.phoneNum;
      address = user_info.recipientInfo.address;
    }
    return this.success({
      code: "200",
      msg: "",
      data: {
        name,
        phone,
        address
      }
    });
  }
}