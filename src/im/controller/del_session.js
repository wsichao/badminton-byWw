/**
 *
 * api 10082 删除会话
 *
 * Created by yichen on 2018/8/3.
 */

module.exports = {
    /**
     * @param session_id
     */
    __rule: function (valid) {
      return valid.object({
        session_id: valid.string().required()
      });
    },
    async postAction() {
      let that = this;
      const imUtilService = Backend.service('im', 'util');
      const sessionResult = await imUtilService.baseRequest('/session/del', 'post', {
        session_id: this.post.session_id,
      });
      if (!sessionResult || sessionResult.errno) {
        return this.fail(8005)
      }
      let restult = {
        code: "200",
        msg: '',
        data : {
            session_id : this.post.session_id
        }
      };
      return this.success(restult)
    }
  }