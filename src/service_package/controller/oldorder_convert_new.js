/**
 * 老订单转换为新订单升级脚本
 * 读取Excel
 */
const xlsx = require('node-xlsx');
const path = require('path');
const file_name = process.env.NODE_ENV == 'production' ? 'orders.xlsx' : 'orders_test.xlsx';
const xlsx_path = path.join(__dirname, `./${file_name}`);
const model = require('./../../../app/models/service_package/servicePackageOrder');
const order_transfer_service = Backend.service('service_package', 'order_transfer');
module.exports = {
  getDate(dateVal) {
    return (new Date(1900, 0, dateVal - 1)).getTime();
  },
  trim(str) {
    str = str + '';
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },
  async getExcel() {
    let list = [];
    let new_list = [];
    let that = this;
    try {
      list = xlsx.parse(xlsx_path);
      list = list[0].data;
      list.forEach((element, index) => {
        if (element.length == 0 || index == 0) return;
        let user_name = element[0]; // 用户名
        let phone = element[1] + ' '; // 手机号
        let sp_ref_id = element[2]; // 服务包-医生 关联id
        let pay_time = element[3]; // 支付时间
        let price = element[4]; // 金额（精度两位）
        let expire_time = element[5]; // 过期时间

        phone = that.trim(phone);
        sp_ref_id = that.trim(sp_ref_id);
        pay_time = that.trim(pay_time);
        price = that.trim(price);
        expire_time = that.trim(expire_time);

        pay_time = that.getDate(pay_time);
        expire_time = that.getDate(expire_time);
        price = price * 100;
        const obj = {
          user_name,
          phone,
          sp_ref_id,
          pay_time,
          price,
          expire_time
        }
        new_list.push(obj);
      });
    } catch (e) {
      console.log(e);
    }
    return new_list;
  },
  async clearAll() {
    await model.update({
      isOrderConvert: true
    }, {
      isDeleted: true
    }, {
      multi: true
    });
  },
  async getAction() {
    // clear all 已经运行过的数据
    await this.clearAll();
    const excel_list = await this.getExcel();
    for (let i = 0; i < excel_list.length; i++) {
      let item = excel_list[i];
      let result = await order_transfer_service.transferOrder({
        name: item.user_name,
        phoneNum: item.phone,
        servicePackageDoctorRef: item.sp_ref_id,
        payTime: item.pay_time,
        price: item.price,
        deadlinedAt: item.expire_time
      })
      item.order = result;
    }
    return this.success({
      data: excel_list
    });
  }
}