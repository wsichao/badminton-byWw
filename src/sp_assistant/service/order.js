/**
 * 2030 助理订单service
 */
const mc_pre_order_model = Backend.model('sp_assistant', undefined, 'mc_pre_order');
const _ = require('underscore');
const mc_service_model = Backend.model('mc_weapp', undefined, 'mc_service');
const mc_doctor_model = Backend.model('mc_weapp', undefined, 'mc_doctor');

module.exports = {
    /**
     * 获取用户的预订单
     * @param {string} user_id 
     */
    async get_order_list(user_id) {
        let result = [];
        let mc_pre_orders = await mc_pre_order_model.find({
            isDeleted: false,
            userId: user_id,
            status: 100,
            type: 1
        }).sort({ createdAt: -1 });
        const service_info = await mc_service_model.findOne({
            sericeNumber: 1,
            isDeleted: false
        }, 'name')
        mc_pre_orders.forEach(item => {
            let resItem = {
                "service_name": service_info.name,
                "service_man_name": item.service_man_name || '',
                "status": 600,
                "order_id": item.orderId || '',
                "due_time": null,
                "type": "buy_advance",
                "created_at": item.createdAt
            }
            result.push(resItem);
        })
        return result;
    },
    /**
     * 预支付订单详情
     * @param {*} _id 
     */
    async get_order_detail(_id) {
        let pre_order = await mc_pre_order_model.findOne({
            isDeleted: false,
            _id,
            type: 2,
            status: 100
        })
        if (!pre_order) {
            return '请求参数有误'
        }
        let doctor = await mc_doctor_model.findOne({ isDeleted: false, _id: pre_order.doctorId })
        let result = {
            "_id": pre_order._id,
            "name": pre_order.name || '',
            "price": pre_order.price,
            "doctor": {
                "avatar": doctor.avatar || '',
                "name": doctor.name || '',
                "department": doctor.department || '',
                "hospital": doctor.hospital || '',
                "title" : doctor.title || ''
            }
        }
        return result;
    }
}