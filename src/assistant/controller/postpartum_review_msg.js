/**
 * 生产日期+35天时通知用户复查定时脚本
 * 该脚本每天早上7点整运行
 * 发现当天用户到复查时间，发送指定消息通知用户
 * 0 7  * * * curl : http://localhost:9050/1/assistant/postpartum_review_msg
 */
const patient_service = Backend.service('assistant', 'patient');
let util = require('../../../lib/common-util');
module.exports = {
    __beforeAction: function () {
        let ip = getClientIp(this.req);
        if (ip.indexOf("127.0.0.1") == -1) {
            return this.fail("必须 127.0.0.1 启用 Controller");
        }
    },
    async getAction() {
        //todo:v5.28.0
        let numbers = await patient_service.getNeedReviewUsers();//查询到复查时间的用户
        let tplId = '2630356';
        if (numbers) {
            await util.sendSms(tplId, numbers);
        }
        return this.success({ code: 200, msg: '' });
    }
}
