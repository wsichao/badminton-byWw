/**
 *
 * 个人提现信息 
 *
 */
'user strict';
const accounting_service = Backend.service("mc_weapp", "accounting");
const user_center_service  = Backend.service('user_center','handle_user_center');

module.exports = {
    __rule: function (valid) {
        return valid.object({
            bankCardName: valid.string().required(),
            sid: valid.string().required(),
            bankCardNum: valid.string().required(),
            bankName: valid.string().required(),
            applicantPhone: valid.string().required(),
            code: valid.string().required(),
        });
      },
    async postAction() {
        const post = this.post;
        //先验证验证码和手机号是否匹配 不匹配返回失败
        const user_center = await user_center_service.login_auth_code(post.applicantPhone,post.code);
        if (!user_center ||  (user_center.errno && user_center.errno != 2003)) {
            return this.success({
                msg : '验证码不正确,请重新输入'
            })
        }
        //到userInfo表中查找是否有 withdrawMessage 
        let user_id = this.req.identity.userId;
        
        let withdrawMessage = {
            bankCardName: post.bankCardName,
            sid: post.sid,
            bankCardNum: post.bankCardNum,
            bankName: post.bankName,
            applicantPhone: post.applicantPhone
        }
        //更新提现信息
        let result = await accounting_service.updateDrawMsg(user_id, withdrawMessage)

        return this.success({
            code : '200',
            msg : '',
            data : result
        });
        
    }
}
