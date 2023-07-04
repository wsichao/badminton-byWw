/**
 *
 * api 老订单 群升级脚本
 * Created by yichen on 2018/8/13.
 */

const _ = require('underscore');
module.exports = {
    async getAction() {
        let that = this;
        const servicePackageOrderModel = require('../../../app/models/service_package/servicePackageOrder');
        const orderGroupRefModel = Backend.model('im', undefined, 'im_group_ps_ref');
        const patientInfoModle = Backend.model('service_package', undefined, 'patient_info');
        const groupService = Backend.service('im','group');
        const assistant_model = Backend.model('assistant',undefined,'sys_user');
        const messageService = Backend.service('im', 'message');
        const patient_infos = await patientInfoModle.find({
            isDeleted: false
        })
        const patient_info_index = _.indexBy(patient_infos,'servicePackageOrder');
        let orderIds = _.map(patient_infos, 'servicePackageOrder');
        orderIds = _.uniq(orderIds);
        const orderGroupRefs = await orderGroupRefModel.find({ isDeleted: false, servicePackageOrderId: { $in: orderIds } });
        const orderIdsFromRef = _.map(orderGroupRefs, 'servicePackageOrderId');
        orderIds = _.difference(orderIds, orderIdsFromRef);
        for (let i = 0; i < orderIds.length; i++) {
            const patient_info = patient_info_index[orderIds[i]];
            let sysAssistant = await assistant_model.findOne({assistantId: patient_info.assistantIds,isDeleted:false});
            let servicePackageOrder = await servicePackageOrderModel.findOne({isDeleted:false,orderId:orderIds[i]});
            if(!sysAssistant){
                continue;
            }
            if(!servicePackageOrder){
                continue;
            }
            //创建群组
            const groupResult = await groupService.createGroup({
                group_name: patient_info.name + '-专属服务群',
                desc: patient_info.name + '-专属服务群',
                owner_user_id: sysAssistant._id,
                group_user_ids: [patient_info.userId, sysAssistant._id]
            })
            //创建order群组关联表
            const refResult = await groupService.groupPackageServiceRef(
                orderIds[i],
                groupResult.data.group_id,
                servicePackageOrder.servicePackageId
            );
            //发送欢迎消息
            const msgResult = await messageService.sendMsg(
                {
                    user_id: sysAssistant._id,
                    to_user_id: groupResult.data.group_id,
                    message_type: "text",
                    message_txt: "您好，欢迎您成为朱李叶专属医生会员，我们为您建立了VIP服务咨询通道，有任何服务需要可以在这里联系我们，服务团队将竭诚为您服务。",
                    target_type: "chatgroups"
                },
                "chatgroups"
            );
            console.log('第'+i+'条成功');
        }
    }
}