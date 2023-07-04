

const user_model = require('../../../app/models/Customer');
const patient_info_model = Backend.model('service_package', undefined, 'patient_info');
const service_package_order_model = require('../../../app/models/service_package/servicePackageOrder.js');
const docotr_role_model = Backend.model('doctor_weapp', undefined, 'doctor_role');
const order_model = Backend.model("mc_weapp", undefined, 'mc_order');
const service_man_model = Backend.model('mc_weapp', undefined, 'mc_service_man');
const _ = require('underscore');
const service_package_model = require('../../../app/models/service_package/servicePackage');
const patient_info_service = Backend.service('service_package', 'patient_info_service');
const user_service = Backend.service('doctor_weapp','user');

module.exports = {
    /**
     * 查询/搜索专属医生会员
     * @param {*} user_id 医生角色用户唯一标识
     * @param {*} query 查询条件
     */
    async searchUsers(user_id, query) {
        let role = await user_service.getRole(user_id);
        if(!role.data){
            return {
               code: '1000',
               msg: '当前用户不是医生角色'
            }
        }
        let res = {
            code: '200',
            msg: '',
            items: []
        };
        if (role.data.servicePackageDoctorId) {
            if (!query.keywords) {//查询医生下会员
                res.items = await this.search_users_by_doctorId(role.data.servicePackageDoctorId, query.page_size || 20, query.page_num || 0);
            } else {//搜索医生下会员
                res.items = await this.search_users_by_keyword(role.data.servicePackageDoctorId, query.keywords);
            }
        }
        return res;
    },
    /**
     * 根据doctor_id查询医生下的会员
     * @param {*} doctor_id 
     * @param {*} page_size 
     * @param {*} page_num 
     */
    async search_users_by_doctorId(doctor_id, page_size, page_num) {
        let userIds = await this.getUsersUnderDoc(doctor_id);
        let cond = {
            isDeleted: false,
            _id: {
                '$in': userIds
            }
        }
        let users = await user_model.find(cond)
            .skip(page_num * page_size)
            .limit(page_size)
            .sort({ pinyinName: 1 })
        let result = [];
        users.forEach(item => {
            let resItem = {
                "_id": item._id,
                "name": item.name,
                "phoneNum": item.phoneNum,
                "avatar": item.avatar,
                "createdAt": item.createdAt,
                "patient_name": ''
            }
            result.push(resItem);
        })
        return result;
    },
    /**
     * 根据手机号/姓名查询医生下的会员
     * @param {*} doctor_id 
     * @param {*} keywords 
     */
    async search_users_by_keyword(doctor_id, keywords) {
        let userIds = await this.getUsersUnderDoc(doctor_id);
        let cond = {
            isDeleted: false,
            _id: {
                '$in': userIds
            },
            '$or': [
                { phoneNum: keywords },
                { name: keywords }
            ]
        }
        let users = await user_model
            .find(cond, '_id name phoneNum avatar createdAt')
            .limit(200).sort({ createdAt: -1 });
        let result = [];
        users.forEach(item => {
            let resItem = {
                "_id": item._id,
                "name": item.name,
                "phoneNum": item.phoneNum,
                "avatar": item.avatar,
                "createdAt": item.createdAt,
                "is_member": false,
                "patient_name": ''
            }
            result.push(resItem);
        })
        let patient_infos = await patient_info_model.find({
            isDeleted: false,
            name: keywords
        }).limit(200).sort({ createdAt: -1 });
        let patient_info_user_ids = patient_infos.map(item => {
            return item.userId;
        });
        let patient_info_users = await user_model
            .find({ isDeleted: false, _id: { $in: patient_info_user_ids } })
            .sort({ createdAt: -1 });
        let users_index = _.indexBy(users, '_id');
        let patient_info_index = _.indexBy(patient_infos, 'userId');
        patient_info_users.forEach(item => {
            if (!users_index[item._id]) {
                let patientResItem = {
                    "_id": item._id,
                    "name": item.name,
                    "phoneNum": item.phoneNum,
                    "avatar": item.avatar,
                    "createdAt": item.createdAt,
                    "is_member": false,
                    "patient_name": patient_info_index[item._id] ? patient_info_index[item._id].name : ''
                }
                result.push(patientResItem);
            }
        });

        return result;
    },
    /**
     * 根据doctor_id查询用户，封装[userid]
     * @param {*} doctor_id 
     */
    async getUsersUnderDoc(doctor_id) {
        let userIds = [];
        let service_package_orders = await service_package_order_model.find({
            doctorId: doctor_id,
            isDeleted: false,
            orderStatus: { $in: [200, 300, 400] },
            deadlinedAt: { $gte: Date.now() }
        });
        service_package_orders.forEach(item => {
            userIds.push((item.userId + ''));
        });
        userIds = _.uniq(userIds);
        return userIds;
    },
    /**
     * 查询健康会员订单
     * @param {*} user_id 
     * @param {*} page_size 
     * @param {*} page_num 
     */
    async searchOrders(user_id, page_size, page_num) {
        let role = await user_service.getRole(user_id);
        if(!role.data){
            return {
               code: '1000',
               msg: '当前用户不是医生角色'
            }
        }
        let result = {
            code: '200',
            msg: '',
            items: []
        };
        if (role.data.mcDoctorId) {
            const order_list = await order_model.find({
                doctorId: role.data.mcDoctorId,
                type: 1,
                isDeleted: false,
                status: 200,
                dueTime: { $gt: Date.now() }
            })
                .skip(page_num * page_size)
                .limit(page_size)
                .sort({ createdAt: -1 });
            let serviceManIds = [];
            let userIds = [];
            order_list.forEach(item => {
                if (item.userId) {
                    userIds.push(item.userId);
                }
                if (item.serviceManId) {
                    serviceManIds.push(item.serviceManId);
                }
            });
            let serviceMans = await service_man_model.find({
                isDeleted: false,
                _id: {
                    '$in': serviceManIds
                }
            });
            var serviceManList = _.indexBy(serviceMans, '_id');
            let users = await user_model.find({ isDeleted: false, _id: { '$in': userIds } }, '_id name ');
            var userList = _.indexBy(users, '_id');
            order_list.forEach(item => {
                let resItem = {
                    'service_name': item.name || '',
                    "order_id": item.orderId,
                    "name": userList[item.userId].name || '',
                    "price": (item.originalPrice) ? item.originalPrice : item.price,
                    "service_man_name": item.serviceManId ? serviceManList[item.serviceManId].name : '',
                    "begin_at": item.paidTime || null,
                    "end_at": item.dueTime || null
                }
                result.items.push(resItem);
            });
        }
        return result;
    },
    /**
     * 查询用户购买的服务包（专属医生）
     * @param {*} d_user_id 
     * @param {*} user_id 
     */
    async getOrderInfo(d_user_id, user_id) {
        let role = await user_service.getRole(d_user_id);
        if(!role.data){
            return {
               code: '1000',
               msg: '当前用户不是医生角色'
            }
        }
        if (!role.data.servicePackageDoctorId) {
            return {
                code: '1001',
                msg: '当前用户不是专属医生角色'
            }
        }
        let res = {
            code: '200',
            msg: '',
            data: {
                user: {},
                orders: []
            }
        };
        let cond = {
            doctorId: role.data.servicePackageDoctorId,
            isDeleted: false,
            userId: user_id,
            orderStatus: {
                $in: [200, 300, 400],
            },
            deadlinedAt: {
                '$gt': Date.now()
            }
        }
        let orders = await service_package_order_model.find(cond).sort({ createdAt: -1 });
        let order_ids = _.map(orders, 'orderId');
        let service_package_ids = _.map(orders, function (item) {
            return item.servicePackageId + ''
        });
        service_package_ids = _.uniq(service_package_ids);
        order_ids = _.uniq(order_ids);
        let service_packages = await service_package_model.find({ _id: { $in: service_package_ids }, isDeleted: false });
        let patient_infos = await patient_info_model.find({ servicePackageOrder: { $in: order_ids }, isDeleted: false });
        let service_packages_index = _.indexBy(service_packages, '_id');
        let patient_infos_index = _.indexBy(patient_infos, 'servicePackageOrder');
        for (var i = 0; i < orders.length; i++) {
            let resItem = {
                order_id: orders[i].orderId,
                service_name: orders[i].servicePackageName,
                icon: '',
                end_at: orders[i].deadlinedAt,
                patient_name: '',
                patient_age: 0,
                patient_sex: '',
                week: ''
            }
            if (service_packages_index[orders[i].servicePackageId]) {
                resItem.icon = service_packages_index[orders[i].servicePackageId].icon;
            }
            if (patient_infos_index[orders[i].orderId]) {
                resItem.patient_name = patient_infos_index[orders[i].orderId].name;
                resItem.patient_age = await patient_info_service.getAge(patient_infos_index[orders[i].orderId].birth, Date.now());
                resItem.patient_sex = patient_infos_index[orders[i].orderId].sex;
            }
            if (patient_infos_index[orders[i].orderId] && patient_infos_index[orders[i].orderId].lastMenstruation) {
                let week = Math.floor((Date.now() - patient_infos_index[orders[i].orderId].lastMenstruation) / (7 * 24 * 60 * 60 * 1000));
                let day = Math.floor(((Date.now() - patient_infos_index[orders[i].orderId].lastMenstruation) % (7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
                let pregnant_week_str = week > 41 ? '已生产' : (day ? '孕' + week + '周' + day + '天' : '孕' + week + '周');
                resItem.week = pregnant_week_str;
            }
            res.data.orders.push(resItem);
        }
        let user = await user_model.findOne({ _id: user_id }, '_id name phoneNum avatar')
        res.data.user.user_name = user.name;
        res.data.user.user_phone = user.phoneNum;
        res.data.user.avatar = user.avatar;
        res.data.user._id = user._id;
        return res;
    }
}