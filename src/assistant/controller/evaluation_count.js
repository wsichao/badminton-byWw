const evaluation_model = Backend.model('service_package', undefined, 'service_evaluation');
const sys_user_service = Backend.service('assistant', 'user');
module.exports = {
  async getAction() {
    const user_id = this.req.identity.userId;
    const sysUser = await sys_user_service.getUserByUserId(user_id, 'assistantId');
    // sysUser.assistantId = '5b46c86f0dd25d6d6ede8abe'; // Test
    const result = await evaluation_model.find({
      assistantId: sysUser.assistantId,
      isDeleted: false
    }, 'assistantStarRating');
    let sum = 0;
    const count = result.length;
    result.forEach(item => {
      sum = sum + item.assistantStarRating
    });
    return this.success({
      code: '200',
      msg: '',
      data: {
        count,
        mark: (parseFloat(sum / count)) || 0
      }
    })
  }
}