/**
 * 合作医生数 服务会员数 用户节省金额（万元）按随机数增长脚本
 * 该脚本每天早上8点整运行
 * 0 8  * * * curl : http://localhost:9050/mc_weapp/time_data_growth
 */
const service = Backend.service('mc_weapp', 'data');

module.exports = {
    __beforeAction: function () {
        let ip = getClientIp(this.req);
        if (ip.indexOf("127.0.0.1") == -1) {
            return this.fail("必须 127.0.0.1 启用 Controller");
        }
    },
    async getAction() {
        let info = await service.updateData();
        return this.success({ code: 200, msg: '' });
    }
}
