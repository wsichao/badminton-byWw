/**
 *
 * tp 购买服务下单
 *
 * Created by yichen on 2018/10/11.
 */

'user strict';

const order_service = Backend.service('tp_memberships','service_order');
module.exports = {
    __rule: function (valid) {
        return valid.object({
            service_id: valid.string().required(),
            discount_coupon_id : valid.string()
        });
    },
    async postAction() {
        const self = this;
        const post = this.post;
        let user_id = this.req.identity.userId
        let result = await order_service.insert_service_order(user_id, post.service_id,post.discount_coupon_id, self.req);
        return self.success(result);
    }
}
