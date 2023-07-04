/**
 *
 * 订单相关service
 * Created by yichen on 2018/10/11.
 */

'user strict';

const order_model = Backend.model('tp_memberships', undefined, 'tp_service_order');
const order_util = Backend.service('tp_memberships', 'common_order');
const service_good_model = Backend.model('tp_memberships', undefined, 'tp_member_service');
const membership_card_model = Backend.model('tp_memberships', undefined, 'tp_membership_card');
const wx_controller = require('../../../app/controllers/WXController');
const supplier_model = Backend.model('tp_memberships', undefined, 'tp_member_supplier');
let message_service = Backend.service('1/message', 'messages');
const user_model = require('../../../app/models/Customer');
const coupon_service = Backend.service('tp_memberships','coupon');


module.exports = {
    async insert_service_order(user_id, service_id, coupon_id , req) {
        let result = {
            code: '200',
            msg: '',
            data: {}
        }
        const now = Date.now();
        let orderId = await order_util.createOrderId('R'); // 系统订单号
        let service_good = await service_good_model.findOne({ isDeleted: false, _id: service_id });
        if (!service_good) {
            return {
                code: '8005',
                msg: '没有此服务'
            }
        }
        let user_cards = [];
        if (service_good.membershipCardTypeId) {
            user_cards = await membership_card_model.find({
                isDeleted: false,
                dueTime: { $gt: now },
                userId: user_id,
                cardId: service_good.membershipCardTypeId
            });
            if (service_good.isMustMember && !user_cards.length) {
                return {
                    code: '8555',
                    msg: '该服务需要充值会员才能购买'
                }
            }
        }
        let price = user_cards.length ? service_good.discountPrice : service_good.price
        // 用户使用优惠券 coupon_service.buyServiceUseCoupon
        let coupon_res;
        if(coupon_id){
            coupon_res = await coupon_service.buyServiceUseCoupon(user_id,service_id,coupon_id,price);
            if(!coupon_res || !coupon_res.can_use){
                return {
                    code: '8556',
                    msg: '该优惠券不可用'
                }
            }
        }
        if(coupon_res && coupon_res.can_use){
            console.log(222);
            price -= coupon_res.coupon.limit
        }
        let new_order = {
            userId: user_id, //用户id
            price, // 价格
            originPrice: service_good.price, //原价
            orderStatus: 100, //100 未支付  200 支付成功 300 被消费
            orderId, //订单id
            wxorderId: '', //微信订单id
            wxTimeStamp: now, //微信时间戳
            serviceId: service_good._id, //服务id
            serviceName: service_good.name, //服务名字
            serviceDetail: service_good.detail, //服务详情
            serviceSmallDetail: service_good.smallDetail, //服务详情
            serviceBigImg: service_good.bigImg, //服务大图
            serviceSmallImg: service_good.smallImg, //服务小图
            serviceIsMustMember: service_good.isMustMember, //必须为会员
            serviceMembershipCardTypeId: service_good.membershipCardTypeId,
            serviceSupplierId: service_good.supplierId, //供应商id
            userDiscountCouponId : coupon_res && coupon_res.can_use && coupon_res.coupon._id || undefined,
            discountCouponPrice : coupon_res && coupon_res.can_use && coupon_res.coupon.limit || 0
        }
        if (new_order.price != 0) {
            const wx_res = await wx_controller.WXPay(req, {
                money: new_order.price / 100,
                tradeNo: orderId,
                body: service_good.name
            });
            new_order.wxorderId = wx_res.prepayId;
            new_order.wxTimeStamp = now;
        }
        let order = await order_model.create(new_order);
        if(order.price == 0){
            await this.pay_serivce_order(order.orderId,'free',order.serviceId);
        }
        result.data = {
            "orderId": order.orderId,
            "wxorderId": order.wxorderId,
            "wxtimeStamp": order.wxTimeStamp,
            "price": order.price,
            "orderName": order.serviceName,
            "orderDesc": order.serviceDetail
        };
        return result
    },
    async pay_serivce_order(orderId, payType, serviceId) {
        var cond = {
            isDeleted: false,
            orderId: orderId
        }
        var update = {
            $set: {
                paidType: payType,
                orderStatus: 200,
                paidTime: Date.now()
            }
        }
        if (payType == 'wx') {
            update['$set'].paidType = 'wechat';
        } else if (payType == 'ali') {
            update['$set'].paidType = 'alipay';
        } else if (payType == 'sys_pay') {
            update['$set'].paidType = 'balance';
        }
        const service_good = await service_good_model.findOne({ _id: serviceId, isDeleted: false });
        if (service_good.periodOfValidity) {
            let paidTimeObj = new Date(update['$set'].paidTime);
            update['$set'].expiredAt = paidTimeObj.setMonth((paidTimeObj.getMonth() + service_good.periodOfValidity));
        }
        const qr_code = await order_util.qr_code_born();
        update['$set'].qrCode = qr_code;
        return await order_model.findOneAndUpdate(cond, update, { new: true });
    },
    async expend_service_order(qr_code, userId) {
        var cond = {
            isDeleted: false,
            qrCode: qr_code
        }
        const order = await order_model.findOne(cond);
        if (order.expiredAt < Date.now()) {
            return {
                code: '801',
                msg: '该订单已经过期'
            }
        }
        if (order.orderStatus == 300) {
            return {
                code: '801',
                msg: '该服务已被使用'
            }
        }
        const supplier = await supplier_model.findOne({
            isDeleted: false,
            _id: order.serviceSupplierId
        })
        let isCorrectShop = false;
        supplier.serviceUsers.forEach(function (item) {
            if (item.userId == userId) {
                isCorrectShop = true
            }
        });
        if (!isCorrectShop) {
            return {
                code: '801',
                msg: '您不是该服务的管理人员！'
            }
        }
        const now = Date.now();
        var update = {
            $set: {
                orderStatus: 300,
                expendBy: userId,
                expendAt:now
            }
        }
        await order_model.findOneAndUpdate(cond, update, { new: true });
        const extras = {
            type: '1',//1有新消息
            contentType: 'checkUserService' //商家扫码核销用户购买的服务
        }
        const pushUser = await user_model.findOne({ _id: order.userId, isDeleted: false });
        message_service.pushMessage(pushUser.pushId, '', extras);
        return {
            code: '200',
            msg: ''
        }
    },
    /**
     * 第三方服务订单过期
     * 查询当前时间前一个小时 未支付 优惠券 订单 退还优惠券 修改订单金额
     * return {coupon_ids : []} 返回需要退换的优惠券id
     */
    async orderOverDue() {
        const now = Date.now();
        let cond = {
            createdAt: { $lte: (now - 60 * 60 * 1000) },
            orderStatus: 100,
            userDiscountCouponId: { $exists: true , '$ne' :null}
        }
        const orders = await order_model.find(cond);
        let coupon_ids = [];
        for (let i = 0; i < orders.length; i++) {
            const item = orders[i];
            await order_model.findOneAndUpdate(
                { _id: item.id },
                { price: (item.price + item.discountCouponPrice) ,userDiscountCouponId : undefined , discountCouponPrice : 0 },
                { new: true });
            coupon_ids.push(item.userDiscountCouponId);
        }
        return coupon_ids;
    }
}