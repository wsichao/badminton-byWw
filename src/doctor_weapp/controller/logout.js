/**
 *
 * 朱李叶健康 医生端小程序-退出用户登录
 *
 */

'user strict';

const weapp_service = Backend.service('doctor_weapp', 'user');
module.exports = {
    async postAction() {
        let user_id = this.req.identity.userId;
        await weapp_service.logout(user_id);
        let result = {
            code: '200',
            msg: '',
        }
        return this.success(result);
    }
}