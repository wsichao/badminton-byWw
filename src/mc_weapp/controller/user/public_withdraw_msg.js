/**
 *
 * 对公提现信息 
 *
 */

'user strict';
const accounting_service = Backend.service("mc_weapp", "accounting");

module.exports = {
    __rule: function (valid) {
        return valid.object({
            corporateName: valid.string().required(),
            corporateCradNum: valid.string().required(),
            corporatebankName: valid.string().required()
        });
      },
    async postAction() {
        
        const post = this.post;
        let user_id = this.req.identity.userId;
        
        let withdrawMessage = {
            corporateName: post.corporateName,
            corporateCradNum: post.corporateCradNum,
            corporatebankName: post.corporatebankName
        }
        //更新提现信息
       let result =  await accounting_service.updateDrawMsg(user_id, withdrawMessage)

        //返回用户信息
        return this.success({
            code : '200',
            msg : '',
            data : result
        });
        
    }
}
