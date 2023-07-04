/**
 *
 * 2030健康-查询个人中心
 *
 */

const service = Backend.service('mc_weapp', 'user');
module.exports = {
  async getAction() {
      let user_id = this.req.identity.userId;
      let info = await service.getUserInfo(user_id);
      let result = {
          code : '200',
          msg : '',
          data : info
      }
      return this.success(result);
  }
}