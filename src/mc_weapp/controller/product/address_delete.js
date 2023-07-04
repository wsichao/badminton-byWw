const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const mongoose = require("mongoose")

module.exports = {
    __rule: function (valid) {
        return valid.object({
            address_id: valid.string().required()
        });
    },
    async postAction() {
        let user_id = this.req.identity.userId;
        let address_id = this.post.address_id;
        const user_info = await mcUserInfoModel.update({
            userId: user_id,
            shopAddressInfo: { $elemMatch: {_id: address_id} }
            },{ $set: { "shopAddressInfo.$.isDeleted": {isDeleted:true} }})
        
        if (user_info.ok == 1) {
            return this.success({
                code: "200",
                msg: "删除地址成功"
            });
        }
        
    }
}