// boss 医生导入用户
const user_service = Backend.service('boss', 'user');
module.exports = {
    __beforeAction: function () {
        console.log('当前的环境', process.env.NODE_ENV);
        if (process.env.NODE_ENV != '_test') {
            let ip = getClientIp(this.req);
            let whiteIP = ['123.56.147.196', '182.92.106.199', '127.0.0.1', '172.31.1.22', '172.31.1.23', '112.125.88.214']; //123.56.147.196 正式公网 182.92.106.199 测试公网
            console.log('请求的ip地址', ip);
            if (whiteIP.indexOf(ip) == -1) {
                return this.fail("必须白名单内的IP才可以访问");
            }
        }
    },
    __rule: function (valid) {
        return valid.object({
            phoneNum: valid.string().required()
        });
    },
    async getAction() {
        let user_id;
        const phoneNum = this.query.phoneNum;
        try {
            user_id = await user_service.new_user(phoneNum);
            await user_service.updatePwd(phoneNum);
        } catch (e) {
            console.log(e);
            return this.success({
                code: '1000',
                msg: '系统错误'
            })
        }
        return this.success({
            code: '200',
            msg: '',
            data : {
                _id : user_id,
                phoneNum
            }
        });
    }
}