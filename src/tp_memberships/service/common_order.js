/**
 *
 * 订单相关service
 * Created by yichen on 2018/10/11.
 */

'user strict';
let commonUtil = require('../../../lib/common-util');
const service_order_model = Backend.model('tp_memberships', undefined, 'tp_service_order');
const card_order_model = Backend.model('tp_memberships', undefined, 'tp_membership_card_order');
const tp_member_supplier_model = Backend.model('tp_memberships', undefined, 'tp_member_supplier');
const card_type_model = Backend.model('tp_memberships', undefined, 'tp_membership_card_type');
const _ = require('underscore');
const card_model = Backend.model('tp_memberships', undefined, 'tp_membership_card');
const uuid = require('uuid');
const chars = ["a", "b", "c", "d", "e", "f",
    "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
    "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5",
    "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I",
    "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
    "W", "X", "Y", "Z"];

module.exports = {
    async createOrderId(prefixes) {
        let objectId = commonUtil.getNewObjectId() + '';
        let md5 = commonUtil.genCommonMD5(objectId);
        let xxxx = md5.substring(0, 4);
        let now = Date.now();
        return (prefixes || '') + xxxx + commonUtil.getyyyyMMddhhmmss(now);
    },
    async order_list(type, user_id) {
        if (type === '1') {
            return await this.serviceOrderList(user_id);
        } else if (type === '2') {
            return await this.cardOrderList(user_id)
        } else {
            return []
        }
    },
    async qr_code_born() {
        let uuid1 = uuid.v1().replace("-", "");
        let shortBuffer = '';
        for (let i = 0; i < 8; i++) {
            let str = uuid1.substring(i * 4, i * 4 + 4);
            let x = parseInt(str, 16);
            shortBuffer += chars[x % 0x3E];
        }
        return shortBuffer;
    },
    async serviceOrderList(user_id) {
        const service_order = await service_order_model.find({
            userId: user_id,
            $or: [
                { orderStatus: 100, createdAt: { $gte: Date.now() - 1000 * 60 * 60 } },
                { orderStatus: { $in: [200, 300] } }],
            isDeleted: false
        }).sort({ 'createdAt': -1 });
        let supplierIds = service_order.map(item => {
            if (item.serviceSupplierId) {
                return item.serviceSupplierId + '';
            }
        });
        supplierIds = _.uniq(supplierIds);
        //1 查询供应商
        const suppliers = await tp_member_supplier_model.find({
            _id: { $in: supplierIds },
            isDeleted: false
        });
        const suppliersIndex = _.indexBy(suppliers, '_id');
        let cardTypeIds = service_order.map(item => {
            if (item.serviceMembershipCardTypeId) {
                return item.serviceMembershipCardTypeId + '';
            }
        });
        cardTypeIds = _.uniq(cardTypeIds);
        const cards = await card_model.find({
            cardId: { $in: cardTypeIds },
            userId: user_id,
            isDeleted: false
        })
        const cardsIndex = _.indexBy(cards, 'cardId');
        let result = [];
        service_order.forEach(item => {
            const supplier = item.serviceSupplierId && suppliersIndex[item.serviceSupplierId] && suppliersIndex[item.serviceSupplierId].name || '';
            let validity = '';
            let order_status = item.orderStatus;
            if (item.orderStatus === 200 || item.orderStatus === 300) {
                validity = dateFormat(item.paidTime, 'yyyy-MM-dd') + '至' + dateFormat(item.expiredAt, 'yyyy-MM-dd');
                if(item.expiredAt < Date.now() && item.orderStatus === 200){
                    order_status = 400;
                }
            }
            const is_member = item.serviceMembershipCardTypeId && cardsIndex[item.serviceMembershipCardTypeId] ? true : false;
            let resultItem = {
                "service_supplier_name": supplier,
                "service_supplier_icon": 'https://cdn.juliye.net/servicedelivery@3x.png',
                "service_validity": validity,
                "service_order_status": order_status,
                "service_order_id": item.orderId,
                "service_wx_order_id": item.wxorderId,
                "service_qr_code": item.qrCode,
                "service_title": item.serviceName,
                "service_icon": item.serviceSmallImg,
                "service_desc": item.serviceSmallDetail,
                "service_price": item.price,
                "service_origin_price": item.originPrice,
                "service_order_name": item.serviceName,
                "service_order_desc": item.serviceSmallDetail,
                "service_wx_timestamp": Date.now(),
                "service_is_member": is_member,
                "coupons_price" : item.discountCouponPrice || 0,
                "service_member_price": item.userDiscountCouponId ? (item.discountCouponPrice + item.price) : item.price,
             }
            result.push(resultItem);
        })
        return result;
    },
    async cardOrderList(user_id) {
        const card_order = await card_order_model.find({
            userId: user_id,
            $or: [
                { orderStatus: 100, createdAt: { $gte: Date.now() - 1000 * 60 * 60 } },
                { orderStatus: 200 }],
            isDeleted: false
        }).sort({ 'createdAt': -1 });
        let cardIds = card_order.map(item => {
            return item.cardId + '';
        });
        cardIds = _.uniq(cardIds);
        const cardTypes = await card_type_model.find({
            _id: { $in: cardIds },
            isDeleted: false
        });
        const cardTypeIndex = _.indexBy(cardTypes, '_id');
        let result = [];
        card_order.forEach(item => {
            let validity = '';
            let order_status = item.orderStatus;
            if (item.orderStatus === 200) {
                validity = dateFormat(item.paidTime, 'yyyy-MM-dd') + '至' + dateFormat(item.endTime, 'yyyy-MM-dd');
                if (item.endTime < Date.now()) {

                    order_status = 300;
                }
            }
            const title = cardTypeIndex[item.cardId] && cardTypeIndex[item.cardId].name || '';
            const card_detail_url = cardTypeIndex[item.cardId] && cardTypeIndex[item.cardId].link || '';
            let resultItem = {
                "card_surface_name": "会员卡",
                "card_surface_icon": "https://cdn.juliye.net/vipcardlittle@3x.png",
                "card_validity": validity,
                "card_order_status": order_status,
                "card_order_id": item.orderId,
                "card_wx_order_id": item.wxorderId,
                "card_name": title,
                "card_icon": 'https://cdn.juliye.net/vipcardbig@3x.png',
                "card_desc": "享受专属会员权益",
                "card_price": item.price,
                "card_origin_price": item.originalPrice,
                "card_order_name": title,
                "card_order_desc": '',
                "card_order_wx_timestamp": Date.now(),
                "card_detail_url": card_detail_url,
            }
            result.push(resultItem);
        })
        return result;
    }


}