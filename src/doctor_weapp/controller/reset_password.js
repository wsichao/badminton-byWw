/**
 *
 * 朱李叶健康 医生端小程序-修改密码
 *
 */

'user strict';

const weapp_service = Backend.service('doctor_weapp', 'user');
const async_service = Backend.service('common','common_async');
module.exports = {
    __rule: function (valid) {
        return valid.object({
            origin_password: valid.string().required(),
            new_password: valid.string().required(),
        });
    },
    async postAction() {
        const user = this.req.identity.user;
        const post = this.post;
        let [err,data] = await async_service.awaitWrap(
            weapp_service.reset_password(user.phoneNum,post.origin_password, post.new_password));
        if(err){
            return this.success(err);
        }else{
            let result = {
                code: '200',
                msg: '',
            }
            return this.success(result);
        }
        
    }
}