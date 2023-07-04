/**
 *
 * api 10092 获取IM账号信息
 *
 * Created by yichen on 2018/8/3.
 */

module.exports = {
    /**
     * @param user_id
     */
    __rule: function (valid) {
      return valid.object({
        user_id: valid.string().required()
      });
    },
    async getAction() {
      let that = this;
      const imUtilService = Backend.service('im', 'util');
      const userIds = [this.query.user_id];
      const userResult = await imUtilService.baseRequest('/user/create', 'post', {
        user_ids: userIds,
      });
      const infoResult = await imUtilService.baseRequest('/user/get', 'get', {
        user_id: this.query.user_id,
      });
      if (!infoResult || infoResult.errno) {
        return this.fail(8005)
      }
      console.log(infoResult)
      return this.success({
        "code": "200", 
        "msg": "", 
        "data": {
            "im_user_name": infoResult.data.im_id || '', 
            "im_user_pwd": infoResult.data.im_id || ''
        }
      })
    }
  }