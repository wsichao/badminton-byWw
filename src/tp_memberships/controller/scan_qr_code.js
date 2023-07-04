/**
 * 扫码验证服务及供应商信息返回
 */
const service = Backend.service('tp_memberships', 'service_qrCodeInfo');
const order_model = Backend.model('tp_memberships', undefined, 'tp_service_order');
const supplier_model = Backend.model('tp_memberships', undefined, 'tp_member_supplier');
module.exports = {
  async getAction() {
     let qr_code = this.query.qr_code;
     let userId = this.req.identity.user._id;
     let order1 = await order_model.findOne({qrCode:qr_code,userId:userId,isDeleted:false});
     if(order1){//用户端使用
      let result = await service.format_serviceInfo(order1.serviceId);
      result.valid_date = dateFormat(order1.paidTime, 'yyyy-MM-dd') + '至' + dateFormat(order1.expiredAt, 'yyyy-MM-dd');
      return this.success({
        code: '200',
        msg: '获取二维码详情',
        data:result
      }) 
     }else{//扫码端使用
        if(!qr_code){
          return this.success({
            code: '8001',
            msg: '扫码失败'
          });
        }
        let order = await order_model.findOne({qrCode:qr_code,isDeleted:false});//去会员服务订单查询qrCode
        if(!order){
          return  this.success({
            code: '8002',
            msg: '请核对商家码'
          });
        }
        const supplier = await supplier_model.findOne({
            isDeleted: false,
            _id: order.serviceSupplierId
        })
        let isCorrectShop = false;
        supplier.serviceUsers.forEach(function (item) {
            if (item.userId.equals(userId)) {
                isCorrectShop = true
            }
        });
        if (!isCorrectShop) {
            return {
                code: '8005',
                msg: '您不是该服务的管理人员！'
            }
        } 
        let timenow = Date.now();
        if(order.expiredAt<timenow){
          return  this.success({
            code: '8003',
            msg: '该码已过有效期'
          });
        };
        if(order.orderStatus==300){
          return  this.success({
            code: '8004',
            msg: '该码已扫过'
          });
        }
        let result = await service.format_serviceInfo(order.serviceId);
        result.valid_date = dateFormat(order.paidTime, 'yyyy-MM-dd') + '至' + dateFormat(order.expiredAt, 'yyyy-MM-dd');
        return this.success({
          code: '200',
          msg: '扫码成功',
          data:result
        }) 
      }
     
   }
}