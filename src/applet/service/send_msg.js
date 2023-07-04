const moment = require("moment");
const userMode = Backend.model('common', undefined, 'customer');
const commonUtil = require('../../../lib/common-util');
const patientInfoModel = Backend.model('service_package', undefined, 'patient_info');

module.exports = {
  /**
   *  获取用户手机号
   * @param {*} user_id 
   * @return phone
   */
  async getUserPhoneNum(user_id) {
    const u = await userMode.findOne({
      _id: user_id,
      isDeleted: false
    }, "phoneNum");
    if (u)
      return u.phoneNum;
    return "";
  },
  /**
   * 获取就诊人姓名
   * @return name
   */
  async patientInfo(order_id) {
    const p = await patientInfoModel.findOne({
      servicePackageOrder: order_id,
      isDeleted: false
    }, "name");
    if (p)
      return p.name;
    return "";
  },
  /**
   * 发送通知消息
   * @param {*} order_id 订单唯一标识
   * @param {*} user_id 用户唯一标识
   * @param {*} work_time 预约时间
   * @param {*} items 预约项目
   */
  async makeAnAppointmentNotice(order_id, user_id, work_time, items) {
    // 检查项目
    if (items.indexOf('金牌会员产后复查') == -1) return;
    // 获取用户手机号
    const phone_num = await this.getUserPhoneNum(user_id);
    const name = await this.patientInfo(order_id);
    // 转换时间
    const time = moment(parseInt(work_time)).format("YYYY-MM-DD");
    console.log(`phone_num=${phone_num}   name=${name}   date=${time}   `)
    commonUtil.sendSms("3123058", phone_num, `#name#=${name}&#date#=${time}`);
  }
}