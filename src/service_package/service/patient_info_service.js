const patient_info_model = Backend.model('service_package', '', 'patient_info');
commonUtil = require('../../../lib/common-util')
module.exports = {
  /**
   * 通过servicePackageOrder获取就诊人信息
   * @param servicePackageOrder
   * @param fields
   */
  getPatientInfoByServicePackageOrder: function (servicePackageOrder, fields) {
    const cond = {
      isDeleted: false,
      servicePackageOrder: servicePackageOrder
    };
    return patient_info_model.find(cond, fields || '');
  },
  /***
   * 通过servicePackageOrders获取就诊人信息
   * @param servicePackageIds
   * @param fields
   */
  getPatientInfoByServicePackageOrders: function (servicePackageOrders, fields) {
    const cond = {
      isDeleted: false,
      servicePackageOrder: { $in: servicePackageOrders }
    };
    return patient_info_model.find(cond, fields || '');
  },
  /***
  * 通过servicePackageOrderId获取就诊人信息
  * @param servicePackageOrderId
  * @param fields
  */
  getPatientInfoByServicePackageOrderId: function (servicePackageOrderId, fields) {
    const cond = {
      isDeleted: false,
      servicePackageOrder: servicePackageOrderId
    };
    return patient_info_model.findOne(cond, fields || '');
  },
  /**
 * 通过就诊人生日及预约时间计算年龄
 * @param birth 就诊人生日
 * @param appoint_time 预约时间
 */
  async getAge(birth, appoint_time) {
    if (birth <= appoint_time) {
      let birth_date = commonUtil.dateFormat(birth, 'yyyy-MM-dd hh:mm:ss');
      let appoint_date = commonUtil.dateFormat(appoint_time, 'yyyy-MM-dd hh:mm:ss');
      let reg = new RegExp(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})(\s)(\d{1,2})(:)(\d{1,2})(:{0,1})(\d{0,2})$/);
      let beginArr = birth_date.match(reg);
      let endArr = appoint_date.match(reg);
      let days = 0;
      let month = 0;
      let year = 0;
      days = endArr[4] - beginArr[4];
      console.log(days);
      if (days < 0) {
        month = -1;
        let t = new Date(endArr[1], endArr[3] - 1, 0)
        days = t.getDate() + days;
      }
      month = month + (endArr[3] - beginArr[3]);
      if (month < 0) {
        year = -1;
        month = 12 + month;
      }
      year = year + (endArr[1] - beginArr[1]);
      let yearString = year > 0 ? year + "岁" : "";
      let mnthString = month > 0 ? month + "个月" : "";
      let dayString = days > 0 ? days + "天" : "";
      let result = "";
      if (endArr[1] == beginArr[1] && endArr[3] == beginArr[3] && endArr[4] == beginArr[4]) {
        result = '0天';
        return result;
      }
      if (year < 1) {
        result = yearString + mnthString + dayString;
      }
      if (year >= 1 && year < 14) {
        result = yearString + mnthString;
      }
      if (year >= 14) {
        result = yearString;
      }
      return result;
    } else {
      return '';
    }
  }
};
