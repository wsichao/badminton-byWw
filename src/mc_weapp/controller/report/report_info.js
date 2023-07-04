/**
 * 诊断报告
 */

const service = Backend.service('mc_weapp', 'report');
const mc_order_model = Backend.model('mc_weapp', undefined, 'mc_order');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      order_id: valid.string().required()
    });
  },
  async getAction() {
    const self = this;
    const query = this.query;
    let mc_order = await mc_order_model.findOne({
      orderId: query.order_id,
      isDeleted: false
    });
    if (!mc_order) {
      return {
        code: '1000',
        msg: '订单不存在'
      }
    }
    let result = '接口异常';
    if (mc_order.type == 0) {
      result = await service.getReportInfo(mc_order);
    } else if (mc_order.type == 1) {
      result = await service.member_servive_order_detail(mc_order);
    }
    if (typeof result != "String") {
      return self.success({
        code: '200',
        msg: '',
        data: result
      });
    } else {
      return self.success({
        code: '1000',
        msg: result,
      });
    }
  }
}