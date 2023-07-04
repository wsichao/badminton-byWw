/**
 * api 10084 创建群组
 */
const group_service = Backend.service('im', 'group');

module.exports = {
  /**
   * @param owner_user_id
   * @param group_user_ids
   * @param service_package_order_id
   */
  __rule: function (valid) {
    return valid.object({
      owner_user_id: valid.string().required(),
      group_user_ids: valid.array(),
      service_package_order_id: valid.string(),
    });
  },
  async postAction() {
    let that = this;
    const owner_user_id = this.post.owner_user_id;
    const group_user_ids = this.post.group_user_ids;
    const service_package_order_id = this.post.service_package_order_id;

    // 创建群组
    let result = await group_service.createGroup({
      owner_user_id,
      group_user_ids
    });
    if (result.errno == 0) {
      const groupId = result.data.group_id;
      // 添加群组与服务包关系
      await group_service.groupPackageServiceRef(service_package_order_id, groupId);
      return that.success({
        code: '200',
        msg: '',
        data: { group_id: groupId }
      })
    } else {
      return that.success({
        code: '1000',
        msg: result.errmsg,
      });
    }

  }
}