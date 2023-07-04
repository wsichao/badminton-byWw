const user_model = require('../../../app/models/Customer');
const customerService = require('../../../app/services/CustomerService');
const user_center_service = Backend.service('user_center', 'handle_user_center');
const servicePackgeOrderService = require('../../../app/services/service_package/servicePackageOrderService');
const servicePackageOrderModel = require('../../../app/models/service_package/servicePackageOrder');
module.exports = {
    /**
     * 
     * @param {*} data 
     * {
     *  name : string 用户名
     *  phoneNum : string 手机号
     *  servicePackageDoctorRef : string 服务包医生关联表
     *  payTime : number 支付时间
     *  price : number 实际金额
     *  deadlinedAt : number 截止时间
     * }
     */
    async transferOrder(data) {
        let user = await user_model.findOne({ isDeleted: false, phoneNum: data.phoneNum });
        if (!user) {
            user = await customerService.validUser(data.phoneNum, data.name);
            await user_center_service.must_init(user);
        };
        const order = await servicePackgeOrderService.createOrder(
            user._id,
            data.servicePackageDoctorRef
        )
        return this.virtualPay(order, data);
    },
    async virtualPay(order, data) {
        const resOrder = await servicePackageOrderModel.findOneAndUpdate(
            {
                isDeleted: false,
                orderId: order.orderId
            },
            {
                $set: {
                    paidType: '',
                    orderStatus: 200,
                    paidTime: data.payTime,
                    mountOfRealPay: data.price,
                    vipPrice: data.price,//会员价   单位分
                    vipDiscountsPrice: 0,
                    deadlinedAt: data.deadlinedAt,
                    isOrderConvert : true,
                    "old" : true
                }
            },
            { new: true }
        );
        //支付完成后 成为会员
        let vip_member_model = Backend.model('service_package',undefined,'vip_member');
        await vip_member_model.methods.insertMember(resOrder.userId);
        return resOrder;
    },
};