const uuid = require('uuid');
const session_token_model = require("./../../../app/models/session_token");
const commonUtil = require('./../../../lib/common-util');

module.exports = {
  /**
   * 创建登录鉴权Token
   * @param {String} user_id 用户唯一标识
   * @param {String} type 应用类型
   */
  async createToken(user_id, type) {
    // create user & type => token
    try {
      let uid = uuid.v4().replace(/-/g, '');
      uid += user_id;
      uid += type
      uid += Date.now();
      let token = commonUtil.genJuliyeMD5(uid).toLocaleUpperCase();
      const login_time = Date.now();
      await session_token_model.update({
        userId: user_id,
        isDeleted: false,
        type
      }, {
        token,
        login_time
      }, {
        upsert: true
      })
      return token;
    } catch (e) {
      console.log(e)
      return;
    }
  },
  /**
   * 检查token是否存在
   * @param {*} user_id 用户唯一标识
   * @param {*} type 应用类型
   * @param {*} token 鉴权token
   */
  async checkToken(user_id, type, token) {
    const count = await session_token_model.count({
      userId: user_id,
      type,
      token,
      isDeleted: false
    })
    return count > 0;
  }
}