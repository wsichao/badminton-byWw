const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const userMode = Backend.model('common', undefined, 'customer');
module.exports = {
  async getVolunteersInfo(user_id) {
    const res = await mcUserInfoModel.findOne({
      userId: user_id,
      isDeleted: false
    });
    let name = '';
    const u = await this.getUserInfo(user_id);
    const avatar = u.avatar;
    if (res.consultingObj && res.consultingObj.name) {
      name = res.consultingObj.name;
    } else {
      name = u.name;
    }
    return {
      name,
      avatar
    }
  },
  async getUserInfo(user_id) {
    return await userMode.findOne({
      _id: user_id,
      isDeleted: false
    }, "name avatar");
  },
  async getAction() {
    const user_id = this.req.identity.userId;
    let name = "";
    let avatar = "";
    const user_info = await mcUserInfoModel.findOne({
      userId: user_id,
      isDeleted: false
    });
    let is_real_name = false;
    if (user_info.consultingObj && user_info.consultingObj.phoneNum) {
      is_real_name = true;
    }
    if (user_info.volunteersUserId) {
      const volunteersInfo = await this.getVolunteersInfo(user_info.volunteersUserId);
      name = volunteersInfo.name;
      avatar = volunteersInfo.avatar;
    }

    return this.success({
      code: "200",
      msg: "",
      data: {
        is_real_name,
        name,
        avatar
      }
    });
  }
}