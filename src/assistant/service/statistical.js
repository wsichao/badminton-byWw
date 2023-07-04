const make_appointment_order_model = require('./../../../app/models/service_package/makeAppointmentOrder');
const moment = require('moment');
const _ = require('underscore');
const item_type_model = Backend.model('service_package', undefined, 'make_appointment_orderItems_dict');
let ServicePackageDoctorAssistantRefService = require('../../../app/services/service_package/servicePackageDoctorAssistantRefService');

module.exports = {
  /**
   * 预约统计详情
   * @param {Number} begin_at 开始时间
   * @param {Number} end_at 结束时间
   * @param {Number} status 预约订单状态 [ 200, 400] 默认200
   * @param {Number} doctor_ids 医生列表
   * @return { reserve_num , items_num , items : [ { type, name , count } ] }
   * reserve_num 预约数
   * items_num 预约项目数
   * type 项目类别
   * name 项目名称
   * count 预约数量
   */
  async makeAppointment(begin_at, end_at, status, doctor_ids = [], assistantId) {
    if (doctor_ids.length == 0) {
      let doctors = await ServicePackageDoctorAssistantRefService.findDoctorsByAssistant(assistantId);
      doctor_ids = doctors.map(doctorId => doctorId.doctorId);
    }
    let cond = {
      isDeleted: false,
      doctorId: {
        $in: doctor_ids
      }
    }

    if (status == -100) {
      cond.status = {
        $in: [200, 400]
      }
    } else {
      cond.status = status;
    }
    const {
      start_time,
      end_time
    } = this.getCurrentTime();

    if (begin_at == 0 && end_at == 0) {
      cond.orderTime = {
        $gte: start_time,
        $lte: end_time
      };
    } else if (begin_at == 0) {
      cond.orderTime = {
        $lte: end_time
      };
    } else if (end_at == 0) {
      cond.orderTime = {
        $gte: begin_at
      };
    } else {
      cond.orderTime = {
        $gte: begin_at,
        $lte: end_at
      };
    }

    const result = await make_appointment_order_model.find(cond);

    let items = [];

    result.forEach(item => {
      if (item.items) {
        item.items.forEach(e => {
          items.push(e);
        })
      }
    })
    const reserve_num = result.length;
    const items_num = _.uniq(items).length;
    const item_statistical = await this.getItems(result);
    return {
      reserve_num,
      items_num,
      items: item_statistical
    }
  },
  /**
   * 获取当天的开始时间与结束时间
   * @return { start_time ,end_time }
   */
  getCurrentTime() {
    const date = new Date()
    let start_time = moment(date).format("YYYY-MM-DD") + ' 00:00:00';
    let end_time = moment(date).format("YYYY-MM-DD") + ' 23:59:59';
    start_time = new Date(start_time).getTime();
    end_time = new Date(end_time).getTime();
    return {
      start_time,
      end_time
    }
  },
  /**
   * 获取预约项目统计
   * @param {*} make_appointment_order 
   * @return [{type, name, count}]
   */
  async getItems(make_appointment_order) {
    let map = {};

    const item_type_map = await this.getItemType()

    make_appointment_order.forEach(make => {
      make.items.forEach(item => {
        if (!map[item]) {
          map[item] = {
            count: 0
          }
        }
        map[item].count = map[item].count + 1;
        map[item].name = item;
        map[item].type = item_type_map[item] || "";
      })
    })
    let result_items = [];
    for (let key in map) {
      result_items.push(map[key]);
    }
    return result_items;
  },
  /**
   * 项目类别
   * @return {key, value} 
   * key : 项目,
   * value : 类别
   */
  async getItemType() {
    const result = await item_type_model.find({
      isDeleted: false
    })
    const parent = _.filter(result, (item) => {
      if (!item.parentId) {
        return true;
      }
      return false;
    })
    const parent_map = _.indexBy(parent, "_id");
    const children = _.filter(result, (item) => {
      if (item.parentId) {
        return true;
      }
      return false;
    })
    let result_map = {};

    children.forEach(item => {
      const key = item.name;
      if (!result_map[key]) {
        result_map[key] = parent_map[item.parentId].name;
      }
    })
    return result_map;
  }
}