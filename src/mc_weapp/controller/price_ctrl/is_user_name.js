const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
module.exports = {
  async getAction() {
    const user_id = this.req.identity.userId;
    const res = await mcUserInfoModel.findOne({
      userId: user_id,
      isDeleted: false
    });
    let is_setting = false;
    if (res.consultingObj && res.consultingObj.phoneNum && res.consultingObj.phoneNum != "") {
      is_setting = true;
    }
    return this.success({
      code: "200",
      msg: "",
      data: {
        is_setting
      }
    });
  }
}