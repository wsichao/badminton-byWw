/**
 *
 * api 10083 创建会话
 *
 * Created by yichen on 2018/8/3.
 */

const messageService = Backend.service('im','message');

module.exports = {
    /**
     * @param from_user_id
     * @param to_user_id
     */
    __rule: function (valid) {
      return valid.object({
        from_user_id: valid.string().required(),
        to_user_id: valid.string().required()
      });
    },
    async postAction() {
      let that = this;
      const imUtilService = Backend.service('im', 'util');
      const sessionResult = await imUtilService.baseRequest('/session/create', 'post', {
        from_user_id: this.post.from_user_id,
        to_user_id: this.post.to_user_id
      });
      if (!sessionResult || sessionResult.errno) {
        if(sessionResult && sessionResult.errno === 1000){
          return this.success({
            code:"1000",
            msg : 'session已存在'
          })
        }
        return this.fail(8005)
      }
      if(this.post.is_welcome == '1' && !sessionResult.errno && !sessionResult.data.is_session_exists){
        
        const msgResult = await messageService.sendMsg(
          {
            user_id : this.post.to_user_id,
            to_user_id :this.post.from_user_id,
            message_type : "text",
            message_txt:"您好，有什么可以帮助您？",
            target_type:"users"
          },
          "users"
        );
      }
      const imUserService = Backend.service('im', 'user');
      let userIds = [this.post.to_user_id];
      userIndex = await imUserService.getUser(userIds);
      let restult = {
        code: "200",
        msg: '',
        "data": {
            "session_id": sessionResult.data.session_id, 
            "user": {
                "user_id": sessionResult.data.to_user_id, 
                "im_id": sessionResult.data.to_im_id, 
                "user_name": userIndex[sessionResult.data.to_user_id].user_name, 
                "avatar": userIndex[sessionResult.data.to_user_id].avatar
            }
        }
      };
      return this.success(restult)
    }
  }