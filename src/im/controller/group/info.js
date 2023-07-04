/**
 * api 10086 群组基本信息
 */
const group_service = Backend.service('im', 'group');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      group_id: valid.string().required()
    });
  },
  async getAction() {
    let that = this;
    const group_id = this.query.group_id;
    const result = await group_service.getGroupInfo(group_id);
    const refResult = await group_service.getOrderInfoByGroupId(group_id);
    let resData = {
      group_id: group_id,
      group_name: result.data.name,
      group_desc: result.data.name,
      type : refResult && refResult.orderId ? 'sp' : 'group',
    }
    if(refResult && refResult.orderId){
      resData.service_package = {
        "order_id": refResult.orderId, 
        "name": refResult.name, 
        "validity_time": refResult.validity_time || 0, 
        "avatar": refResult.icon
      }
    }
    if (result.errno == 0) {
      return that.success({
        code: '200',
        msg: '',
        data: resData
      });
    } else {
      return that.success({
        code: '200',
        msg: result.errmsg
      });
    }

  }
}