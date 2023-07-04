/**
 *
 * 新增病例
 *
 * Created by yichen on 2018/7/4.
 */




/**
 *
 * 将康档案列表
 *
 * Created by yichen on 2018/7/4.
 */

/**
 *
 *会员资料
 *
 * Created by yichen on 2018/7/3.
 */

'user strict';

const disease_model = Backend.model('service_package',undefined,'disease_case');
const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required(),
      check_time: valid.number().required(),
      selected_reservations: valid.array(),
      service_package_order_id: valid.string(),
    });
  },
  postAction: function () {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId;
    let result = co(function* () {
      let disease_new = {
        servicePackageOrderId : post.service_package_order_id,
        userId : post.user_id,  // 病例所有者id
        checkTime : post.check_time, //检查时间
        selectedReservations  : post.selected_reservations, //以选择预约
        checkDetail : post.check_detail , //检查详情
        checkImgs : post.check_imgs , //资料图片
        memo : post.memo, //备注
        assistantId : user_id
      }
      let diseases = yield disease_model.create(disease_new);
      let result = {
        code : '200',
        msg : '',
      }
      return result;
    });
    return self.success(result);
  }
}