/**
 *
 * 订单相关service
 * Created by yichen on 2018/10/15.
 */

'user strict';

const order_model = Backend.model('tp_memberships', undefined, 'tp_membership_card_order');
const order_util = Backend.service('tp_memberships', 'common_order');
const card_type_model = Backend.model('tp_memberships', undefined, 'tp_membership_card_type');
const wx_controller = require('../../../app/controllers/WXController');
const card_model = Backend.model('tp_memberships', undefined, 'tp_membership_card');

module.exports = {
    async insert_service_order(user_id, card_id, req) {
        let result = {
            code: '200',
            msg: '',
            data: {}
        }
        const now = Date.now();
        let orderId = await order_util.createOrderId('C'); // 系统订单号
        let card_good = await card_type_model.findOne({ isDeleted: false, _id: card_id });
        if (!card_good) {
            return {
                code: '8005',
                msg: '没有此卡'
            }
        }
        let price = card_good.price;
        if (card_good.activity &&
            card_good.activity.startTime < now &&
            card_good.activity.endTime > now) {
            price = card_good.activity.discountPrice;
        }
        let new_order = {
            userId: user_id, //用户id
            price, // 价格
            cardId: card_good._id, //卡id
            orderStatus: 100, //100 未支付  200 支付成功
            orderId, //订单id
            originalPrice: card_good.price, //原价
            dueTime: card_good.periodOfValidity //有效期
        }
        if (new_order.price != 0) {
            const wx_res = await wx_controller.WXPay(req, {
                money: new_order.price / 100,
                tradeNo: orderId,
                body: card_good.name
            });
            new_order.wxorderId = wx_res.prepayId;
            new_order.wxTimeStamp = now;
        }
        let order = await order_model.create(new_order);
        if(order.price == 0){
            await this.pay_order(order,'free');
        }
        result.data = {
            "orderId": order.orderId,
            "wxorderId": order.wxorderId || '',
            "wxtimeStamp": order.wxTimeStamp,
            "price": order.price,
            "orderName": card_good.name,
            "orderDesc": ''
        };
        return result
    },
    async pay_order(order, payType) {
        const card = await card_model.findOne({
            isDeleted: false,
            userId: order.userId,
            cardId: order.cardId
        });
        const cond = {
            isDeleted: false,
            orderId: order.orderId
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
        if (order.dueTime) {
            update['$set'].renewTime = update['$set'].paidTime;
            if (card && card.dueTime > Date.now()) {
                update['$set'].renewTime = card.dueTime;
            }
            let renewTime = new Date(update['$set'].renewTime);
            update['$set'].endTime = renewTime.setMonth((renewTime.getMonth() + order.dueTime));
        }
        const orderUpdate = await order_model.findOneAndUpdate(cond, update, { new: true });
        if (card) {
            await card_model.findOneAndUpdate({
                _id: card._id,
                isDeleted: false
            }, {
                    dueTime: orderUpdate.endTime
                }, { new: true });
        } else {
            await card_model.create({
                userId: orderUpdate.userId,
                // 会员卡类型唯一标识
                cardId: orderUpdate.cardId,
                // 到期时间
                dueTime: orderUpdate.endTime
            })
        }


    }
}