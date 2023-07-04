/**
 *
 * 医生账户倒入脚本
 * Created by yichen on 2019/2/25.
 */

const service_package_doctor_model = require('../../../app/models/service_package/servicePackageDoctor');
const mc_doctor_model = Backend.model('mc_weapp', undefined, 'mc_doctor');
const boss_user_service = Backend.service('boss', 'user');
const doctor_weapp_service = Backend.service('doctor_weapp', 'user');


module.exports = {
    // __beforeAction: function () {
    //     let ip = getClientIp(this.req);
    //     if (ip.indexOf("127.0.0.1") == -1) {
    //         return this.fail("必须 127.0.0.1 启用 Controller");
    //     }
    // },
    async getAction() {
        let doctor_cond = {
            isDeleted: false, phone: { $exists: true, $ne: '' }
        }
        const service_doctor = await service_package_doctor_model.find(doctor_cond);
        const mc_doctor = await mc_doctor_model.find(doctor_cond);
        for (let i = 0; i < service_doctor.length; i++) {
            let user_id = await boss_user_service.new_user(service_doctor[i].phone);
            if(!user_id){
                continue;
            }
            await boss_user_service.updatePwd(service_doctor[i].phone);
            await doctor_weapp_service.create_role(user_id, undefined, service_doctor[i]._id);
            console.log('第' + i + '个服务包医生数据完成');
        }
        for (let i = 0; i < mc_doctor.length; i++) {
            let user_id = await boss_user_service.new_user(mc_doctor[i].phone);
            if(!user_id){
                continue;
            }
            await boss_user_service.updatePwd(mc_doctor[i].phone);
            await doctor_weapp_service.create_role(user_id, mc_doctor[i]._id, undefined);
            console.log('第' + i + '个2030医生数据完成');
        }
        return this.success({code:'200',msg:''})
    }
}