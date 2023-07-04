const service = Backend.service('sp_assistant', 'order');

module.exports = {
    __rule: function (valid) {
        return valid.object({
            _id: valid.string().required()
        });
    },
    async getAction() {
        let _id = this.query._id;
        let result = await service.get_order_detail(_id);
        if (typeof result != 'string') {
            return this.success({
                code: '200',
                msg: '',
                data: result
            });
        } else {
            return this.success({
                code: '1000',
                msg: result,
            })
        }

    }
}