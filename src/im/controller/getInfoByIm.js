/**
 *
 * api 10095 通过im id获取用户信息
 *
 * Created by yichen on 2018/8/3.
 */

module.exports = {
    /**
     * @param im_id
     */
    __rule: function (valid) {
        return valid.object({
            im_id: valid.string().required()
        });
    },
    async getAction() {
        let that = this;
        const imUtilService = Backend.service('im', 'util');
        const infoResult = await imUtilService.baseRequest('/user/get_user', 'get', {
            im_id: this.query.im_id,
        });
        if (!infoResult || infoResult.errno) {
            return this.fail(8005)
        }
        const imUserService = Backend.service('im', 'user');
        userIndex = await imUserService.getUser([infoResult.data.user_id]);
        return this.success({
            "code": "200",
            "msg": "",
            "data": {
                "user_id": userIndex[infoResult.data.user_id]._id,
                "user_name": userIndex[infoResult.data.user_id].user_name,
                "avatar": userIndex[infoResult.data.user_id].avatar
            }
        })
    }
}