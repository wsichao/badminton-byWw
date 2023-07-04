const order_util = Backend.service('tp_memberships', 'common_order');
const user_model = require('../../../app/models/Customer');
const pre_order_model = Backend.model("sp_assistant", undefined, 'mc_pre_order');
const order_model = Backend.model('mc_weapp', undefined, 'mc_order');
const service_man_model = Backend.model('mc_weapp', undefined, 'mc_service_man');
const doctor_model = Backend.model('mc_weapp', undefined, 'mc_doctor');
const mc_service_model = Backend.model('mc_weapp', undefined, 'mc_service');
const _ = require('underscore');

module.exports = {
    /**
     * 根据用户姓名和手机号搜索用户
     * @param {*} keyword 
     */
    async get_users_by_keyword(keyword) {
        let result = {
            code: '200',
            msg: '',
            items: []
        }
        let cond = {
            isDeleted: false,
            '$or': [
                { phoneNum: keyword },
                { name: keyword }
            ]
        }
        let users = await user_model.find(cond, '_id name phoneNum avatar');
        users.forEach(item => {
            let resItem = {
                user_id: item._id || '',
                name: item.name || '',
                phone: item.phoneNum || '',
                avatar: item.avatar || ''
            }
            result.items.push(resItem);
        });
        return result;
    },
    /**
     * 根据医生姓名查询医生信息
     * @param {*} keyword 
     */
    async get_doctors_by_keyword(keyword) {
        let result = {
            code: '200',
            msg: '',
            items: []
        }
        let cond = {
            isDeleted: false,
            name: keyword
        }
        let doctors = await doctor_model.find(cond);
        console.log(doctors);
        doctors.forEach(item => {
            let resItem = {
                doctor_id: item._id || '',
                name: item.name || '',
                avatar: item.avatar || '',
                title: item.title || '',
                department: item.department || '',
                hospital: item.hospital || '',
                area: ''
            }
            if (item.province == item.city) {
                resItem.area = item.city + item.town
            } else {
                resItem.area = item.province + item.city + item.town
            }
            result.items.push(resItem);
        });
        return result;
    },
    /**
     * 
     * @param {*} assistant_id 助理唯一标识
     * @param {*} arg 数据包 user_id(用户唯一标识),doctor_id（医生唯一标识）,price（价格）
     */
    async create_pre_order(assistant_id, arg) {
        let result = {
            code: '200',
            msg: ''
        }
        if (arg.price.toString().split(".")[1] && arg.price.toString().split(".")[1].length > 2) {
            return {
                code: '8006',
                msg: '输入价格不正确'
            }
        }
        if (arg.price < 100 || arg.price > 10000) {
            return {
                code: '8005',
                msg: '定金价格大于等于100元或者小于等于10000'
            }
        }
        let orderId = await order_util.createOrderId('T');
        let pre_order = {
            userId: arg.user_id,
            doctorId: arg.doctor_id,
            assistantId: assistant_id,
            status: 100,
            orderId: orderId,
            type: 2,
            price: arg.price * 100,
            name: '朱李叶会员（预定）',
            desc: '朱李叶会员（预定）'
        }
        await pre_order_model.create(pre_order);
        return result;
    },
    /**
     * 
     * @param {*} assistant_id 助理唯一标识
     * @param {*} type 1：未购买 2：已购买
     */
    async get_order_list(assistant_id, type) {
        let result = {
            code: '200',
            msg: '',
            items: []
        }
        let orders = [];
        if (type == 1) {
            let cond = {
                isDeleted: false,
                type: 2,
                assistantId: assistant_id,
                status: 100
            }
            orders = await pre_order_model.find(cond).sort({ 'createdAt': -1 });
        } else if (type == 2) {
            let cond = {
                isDeleted: false,
                assistantId: assistant_id,
                status: { $in: [200, 300, 400, 500, 600, 700] },
            }
            orders = await order_model.find(cond).sort({ 'paidTime': -1 });
        }
        var userIds = [];
        var service_man = [];
        orders.forEach(item => {
            if (item.userId) {
                userIds.push(item.userId);
            }
            if (item.serviceManId) {
                service_man.push(item.serviceManId);
            }
        });
        let user = await user_model.find({ isDeleted: false, _id: { '$in': userIds } }, '_id name phoneNum');
        let service_man_info = await service_man_model.find({ isDeleted: false, _id: { '$in': service_man } });
        let userIndex = _.indexBy(user, '_id');
        let serviceManIndex = _.indexBy(service_man_info, '_id');
        console.log('-------1------');
        console.log(service_man_info);
        console.log(serviceManIndex);
        console.log('-------1------');
        orders.forEach(item => {
            let resItem = {
                user_name: userIndex[item.userId].name || '',
                user_phone: userIndex[item.userId].phoneNum || '',
                service_man_name: (type == 2 && serviceManIndex[item.serviceManId]) ? serviceManIndex[item.serviceManId].name : '',
                service_man_phone: (type == 2 && serviceManIndex[item.serviceManId]) ? serviceManIndex[item.serviceManId].phoneNum : '',
                order_name: item.name || '',
                price: ((type == 2 && item.type == 1) ? item.originalPrice : item.price) || item.price,
                order_id: item.orderId || '',
                order_time: (type == 2) ? item.paidTime : item.createdAt
            }
            result.items.push(resItem);
        });
        return result;
    }
}