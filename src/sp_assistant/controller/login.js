const user_service = Backend.service('sp_assistant', 'user');
const CommonInfoService = require('./../../../app/services/CommonInfoService');
const sessionTokenService = Backend.service('common','session_token');

module.exports = {
    __beforeAction() {
        if (!(this.post.phone_num && this.post.pwd)) {
            return this.success({
                code: '1000',
                msg: '登录失败，请输入正确的参数'
            })
        }
    },
    __rule: function (valid) {
        return valid.object({
            phone_num: valid.string().required(),
            pwd: valid.string()
        });
    },
    async postAction() {
        let that = this;
        const userName = this.post.phone_num;
        const pwd = this.post.pwd;
        const result = await user_service.pwdLogin(userName, pwd);
        if (typeof result != 'string') {
            const token = await sessionTokenService.createToken(result._id,'2030Assistant');
            returnValue = {
                _id: result._id,
                token: token,
                avatar: result.avatar || '',
                nick_name: result.name || '',
                phone_num: result.phoneNum
            }
            returnValue[CommonInfoService.CONS.PARAMS.CDN] = CommonInfoService.getCDN();
            return that.success({ code: '200', msg: '', data: returnValue });
        } else {
            return that.success({ code: '1000', msg: result });
        }
    }
}