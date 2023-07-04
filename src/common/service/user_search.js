/**
 * Created by yichen on 2018－11－06.
 */

'use strict';
const user_model = require('../../../app/models/Customer');
const service_package_order_model = require('../../../app/models/service_package/servicePackageOrder.js');
const make_appointment_order_model = require('../../../app/models/service_package/makeAppointmentOrder');
const vip_member_model = Backend.model('service_package', undefined, 'vip_member');
const _ = require('underscore');
const patient_info_model = Backend.model('service_package', undefined, 'patient_info');
module.exports = {
  async search_users(query) {
    let that = this;
    let page_num = Number(query.page_num) || 0;
    let page_size = Number(query.page_size) || 0;
    let users = [];
    if (query.keywords) {
      users = await that.search_users_by_keyword(query.keywords, query.page_num);
    }
    if (query.doctorid) {
      users = await that.search_users_by_doctorId(query.doctorid, page_size, page_num, query.status);
    }
    if (!query.keywords && !query.doctorid) {
      users = await user_model.find({
          isDeleted: false
        }, '_id name phoneNum avatar createdAt')
        .sort({
          createdAt: -1
        })
        .skip(page_num * page_size)
        .limit(page_size);
    }
    const userIds = users.map(item => {
      return item._id;
    })
    const vip_members = await vip_member_model.methods.getVipUsers(userIds);
    const vip_members_index = _.indexBy(vip_members, 'userId')
    users.forEach(item => {
      if (vip_members_index[item._id]) {
        item.is_member = true;
      }
    })
    // TODO 6.8.0 获取下次预约信息
    users = await that.getmakeAppointmentInfo(users);
    return users;

  },
  /**
   * 搜索用户通过关键字
   * @param {*} keywords 搜索关键字
   * @param {*} page_num 分页
   * return [] 用户列表
   */
  async search_users_by_keyword(keywords, page_num = 0) {
    let cond = {
      isDeleted: false,
      '$or': [{
          phoneNum: keywords
        },
        {
          name: keywords
        }
      ]
    }
    if (page_num != 0) {
      return [];
    }
    let users = await user_model
      .find(cond, '_id name phoneNum avatar createdAt')
      .limit(200).sort({
        createdAt: -1
      });
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
    }).limit(200);

    let patient_info_user_ids = patient_infos.map(item => {
      return item.userId;
    });
    let patient_info_users = await user_model
      .find({
        isDeleted: false,
        _id: {
          $in: patient_info_user_ids
        }
      })
      .sort({
        createdAt: -1
      });
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
  async search_users_by_doctorId(doctorid, page_size = 20, page_num = 0, status = -100) {
    let cond = {
      isDeleted: false
    }
    let cond_status = [];
    if (status == -100) {
      cond_status = [200, 300, 400]
    } else {
      cond_status = [status]
    }
    let select_users = [];
    let service_package_orders = await service_package_order_model.find({
      doctorId: doctorid,
      isDeleted: false,
      orderStatus: {
        $in: cond_status
      },
      deadlinedAt: {
        $gte: Date.now()
      }
    });
    service_package_orders.forEach(item => {
      select_users.push((item.userId + ''));
    });
    select_users = _.uniq(select_users);
    cond['_id'] = {
      '$in': select_users
    }
    let users = await user_model.find(cond)
      .skip(page_num * page_size)
      .limit(page_size)
      .sort({
        pinyinName: 1
      })
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
    return result;
  },
  // TODO 6.8.0 获取下次预约信息
  async getmakeAppointmentInfo(users) {
    const user_ids = users.map(item => item._id);
    let make_appointment_order_list = await make_appointment_order_model.find({
      userId: {
        $in: user_ids
      },
      status: 200,
      orderTime: {
        $gte: Date.now()
      },
      isDeleted: false
    }).sort({
      orderTime: -1
    });
    make_appointment_order_list = _.uniq(make_appointment_order_list, true, "_id");
    const make_appointment_order_map = _.indexBy(make_appointment_order_list, 'userId');
    users = users.map(item => {
      if (make_appointment_order_map[item._id]) {
        item.appoint_time = make_appointment_order_map[item._id].orderTime || 0;
      } else {
        item.appoint_time = 0;
      }
      return item;
    })
    return users
  },
}