/**
 *
 * 朱李叶健康 医生端小程序-我的信息
 *
 */

'user strict';
const user_service = Backend.service('doctor_weapp', 'user');

module.exports = {
  async getAction() {
    let user = this.req.identity.user;
    let role = await user_service.getRole(user._id);
    // 根据用户信息获取医生信息
    let doctor_id = '';
    let type = 0;
    if (role.data.servicePackageDoctorId) {
      type = 0;
      doctor_id = role.data.servicePackageDoctorId;
    } else if (role.data.mcDoctorId) {
      type = 1;
      doctor_id = role.data.mcDoctorId;
    }
    const doctor_info = await user_service.getDoctorInfo(doctor_id, type);
    let result = {
      code: '200',
      msg: '',
      data: {
        "_id": user._id || '',
        "name": doctor_info.name || '',
        "avatar": doctor_info.avatar || '',
        "phoneNum": user.phoneNum || '',
        "role": role.role || []
      }
    }
    return this.success(result);
  }
}