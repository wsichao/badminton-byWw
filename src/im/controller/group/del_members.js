const group_service = Backend.service('im', 'group');

/**
 * api 10090 移除群组成员
 */

module.exports = {
  __rule: function (valid) {
    return valid.object({
      group_id: valid.string().required(),
      group_member_ids: valid.array().default([]),
    });
  },
  async postAction() {
    const group_id = this.post.group_id;
    const member_ids = this.post.group_member_ids;
    let result = await group_service.removeGroupMember(group_id, member_ids);
    if (result.errno == 0) {
      return this.success({ code: '200', msg: '' });
    } else {
      return this.success({ code: '1000', msg: result.errmsg });
    }
  }
}