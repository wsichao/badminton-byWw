/**
 *
 * tp核销服务
 *
 * Created by yichen on 2018/10/11.
 */

'user strict';

const order_service = Backend.service('tp_memberships','service_order');
module.exports = {
    __rule: function (valid) {
        return valid.object({
            qr_code: valid.string().required()
        });
    },
    async postAction() {
        const self = this;
        const post = this.post;
        let user_id = this.req.identity.userId
        let result = await order_service.expend_service_order(post.qr_code, user_id);
        return self.success(result);
    }
}
