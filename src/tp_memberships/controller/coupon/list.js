// 10118 会员卡券接口

const couponService = Backend.service('tp_memberships', 'coupon');
module.exports = {
    __rule: function (valid) {
        return valid.object({
            service_id: valid.string(),
            page_size: valid.number().default(20),
            page_num: valid.number().default(0),
        });
    },
    async getAction() {
        const user_id = this.req.identity.userId;
        let service_id = this.req.query.service_id;
        let page_size = this.req.query.page_size || 20;
        let page_num = this.req.query.page_num || 0;
        let results = await couponService.list(user_id, service_id, page_num, page_size);
        return this.success({
            code: '200',
            msg: '',
            items: results
        })
    }
}