const service = Backend.service('tp_memberships', 'common_order');

module.exports = {
    __rule: function (valid) {
        return valid.object({
            type: valid.string().default('1'),
        });
    },
    async getAction() {
        const type = this.query.type;
        const user_id = this.req.identity.user._id;
        const list = await service.order_list(type, user_id);
        return this.success({
            code: '200',
            msg: '',
            items: list
        });
    }
}