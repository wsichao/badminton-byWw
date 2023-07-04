const order_model = Backend.model('mc_weapp', undefined, 'mc_order');
const service_man_model = Backend.model('mc_weapp', undefined, 'mc_service_man');
const doctor_model = Backend.model('mc_weapp', undefined, 'mc_doctor');
const _ = require('underscore');

module.exports = {
  /**
   * 
   * @param {*} assistant_id 助理唯一标识
   */
  async get_doctor_lists(assistant_id) {
    let result = {
      code: '200',
      msg: '',
      items: []
    }
    let cond = {
      isDeleted: false,
      assistantId: assistant_id
    }
    let doctors = await doctor_model.find(cond);
    for (i = 0; i < doctors.length; i++) {
      let num = await order_model.count({
        isDeleted: false,
        doctorId: doctors[i]._id,
        status: {
          $gte: 200
        },
        isPreFrom: {
          '$ne': true
        },
      });
      let resItem = {
        doctor_id: doctors[i]._id,
        name: doctors[i].name,
        avatar: doctors[i].avatar,
        department: doctors[i].department,
        hospital: doctors[i].hospital,
        title: doctors[i].title,
        member_num: num
      }
      if (doctors[i].province == doctors[i].city) {
        resItem.area = doctors[i].city + doctors[i].town
      } else {
        resItem.area = doctors[i].province + doctors[i].city + doctors[i].town
      }
      result.items.push(resItem);
    }
    return result;
  },
  /**
   * 
   * @param {*} doctor_id 医生唯一标识
   */
  async get_user_lists(doctor_id) {
    let result = {
      code: '200',
      msg: '',
      items: []
    }
    let orders = await order_model.find({
      isDeleted: false,
      doctorId: doctor_id,
      status: 200
    }).sort({
      'paidTime': -1
    });
    let service_man_ids = [];
    orders.forEach(item => {
      if (item.serviceManId) {
        service_man_ids.push(item.serviceManId);
      }
    });
    let service_man_info = await service_man_model.find({
      isDeleted: false,
      _id: {
        '$in': service_man_ids
      }
    });
    let serviceManIndex = _.indexBy(service_man_info, '_id');
    orders.forEach(item => {
      let resItme = {
        service_man_name: (item.serviceManId) ? serviceManIndex[item.serviceManId].name : '',
        service_man_phone: (item.serviceManId) ? serviceManIndex[item.serviceManId].phoneNum : '',
        start_time: item.paidTime || 0,
        end_time: item.dueTime || 0,
        order_id: item.orderId
      }
      result.items.push(resItme);
    });
    return result;
  }
}