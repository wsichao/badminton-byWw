/**
 *
 * tp 购买会员卡下单
 *
 * Created by yichen on 2018/10/15.
 */

'user strict';

const order_service = Backend.service('tp_memberships','card_order');
module.exports = {
    __rule: function (valid) {
        return valid.object({
            card_id: valid.string().required()
        });
    },
    async postAction() {
        const self = this;
        const post = this.post;
        let user_id = this.req.identity.userId
        let result = await order_service.insert_service_order(user_id, post.card_id, self.req);
        return self.success(result);
    }
}
