const pre_order_model = Backend.model('sp_assistant', undefined, 'mc_pre_order');
const doctor_service = Backend.service('mc_weapp', 'doctor');
module.exports = {
  /**
   * 获取用户预订单列表
   * @param {*} user_id 用户唯一标识
   */
  async get_order_list(user_id) {
    const cond = {
      userId: user_id,
      isDeleted: false,
      status: 100,
      type: 2
    }
    // 获取用户预订单信息
    let list = await pre_order_model.find(cond, 'name orderId doctorId createdAt');
    const doctorIds = list.map(item => {
      return item.doctorId;
    });
    // 获取医生信息
    const doctorMap = await doctor_service.getDoctorInfoListMap(doctorIds)
    const result = list.map(pre_order => {
      const doctor_id = pre_order.doctorId;
      const doctor = doctorMap[doctor_id] || {};
      const doctor_name = doctor.name;
      const created_at = doctor.createdAt;
      const type = 'buy_advance';
      const order_id = pre_order.orderId;
      const _id = pre_order._id;
      const service_name = pre_order.name;
      return {
        service_name,
        type,
        _id,
        order_id,
        doctor_name,
        created_at
      }
    });
    return result;
  },

}