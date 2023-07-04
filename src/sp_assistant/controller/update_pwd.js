const user_service = Backend.service('sp_assistant', 'user');

module.exports = {
    __rule: function (valid) {
        return valid.object({
            new_pwd: valid.string().required(),
            code: valid.string().required()
        });
    },
    async postAction() {
        let that = this;
        const new_pwd = that.post.new_pwd;
        const code = that.post.code;
        const user = that.req.identity.user;
        const user_id = user._id;
        const phone_num = user.phoneNum;
        let result = await user_service.updatePwd( phone_num, new_pwd, code);
        if (typeof result == 'string') {
            return that.success({
                code: '1000',
                msg: result
            })
        }
        return that.success({
            code: 200,
            msg: ''
        });
    }
}