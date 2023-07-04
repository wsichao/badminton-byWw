const statis_service = Backend.service('assistant', 'statistical');
const sys_user_service = Backend.service('assistant', 'user');

module.exports = {
  __beforeAction() {
    this.query.begin_at = this.query.begin_at || 0; // 当天开始时间
    this.query.end_at = this.query.end_at || 0; // 当天结束时间
    this.query.status = this.query.status || -100; // 未预约
    this.query.doctor_ids = this.query.doctor_ids || []; // 医生列表
  },
  __rule(valid) {
    return valid.object({
      begin_at: valid.number(), // 开始时间
      end_at: valid.number(), // 结束时间
      status: valid.number(), // 状态
      doctor_ids: valid.array() // 医生列表
    });
  },
  async getAction() {
    const begin_at = this.query.begin_at;
    const end_at = this.query.end_at;
    const status = this.query.status;
    const doctor_ids = this.query.doctor_ids;
    const user_id = this.req.identity.userId;

    const sysUser = await sys_user_service.getUserByUserId(user_id, 'assistantId');
    let assistantId = sysUser.assistantId;


    const result = await statis_service.makeAppointment(begin_at, end_at, status, doctor_ids, assistantId);

    return this.success({
      code: '200',
      msg: '',
      data: result
    });
  },

}