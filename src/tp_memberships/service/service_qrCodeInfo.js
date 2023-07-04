'user strict';

const service_model = Backend.model('tp_memberships', undefined, 'tp_member_service');
const supplier_model = Backend.model('tp_memberships', undefined, 'tp_member_supplier');

module.exports = {
    async format_serviceInfo(serviceId){
       let serviceInfo = await service_model.findOne({_id:serviceId,isDeleted:false});//查询会员服务信息
       let supplierInfo = await supplier_model.findOne({_id:serviceInfo.supplierId,isDeleted:false});//查询供应商信息
       let data = {};
       data.name = serviceInfo.name;
       data.desc = serviceInfo.smallDetail;
       data.price = serviceInfo.price;
       (serviceInfo.useCondition == undefined) ?(data.conditions = ''):(data.conditions = serviceInfo.useCondition);
       data.supplier = supplierInfo.name;
       data.address = supplierInfo.province+supplierInfo.city+supplierInfo.district+supplierInfo.address;
       data.bigIcon = serviceInfo.bigImg;
       data.smallIcon = serviceInfo.smallImg;
       return data;
    }
}