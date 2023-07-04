/**
 * 200028 获取用户真实姓名信息
 * method: Get
 * @response { code,msg,data:{ name,phone } }
 */

const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');

module.exports = {
  async getAction() {
    const user_id = this.req.identity.userId;
    const res = await mcUserInfoModel.findOne({
      userId: user_id,
      isDeleted: false
    })
    let name = "";
    let phone = "";
    if (res && res.consultingObj) {
      name = res.consultingObj.name || "";
      phone = res.consultingObj.phoneNum || "";
    }
    return this.success({
      code: "200",
      msg: "",
      data: {
        name,
        phone
      }
    });
  }
}