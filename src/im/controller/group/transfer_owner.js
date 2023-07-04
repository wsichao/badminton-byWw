const group_service = Backend.service('im', 'group');

/**
 * api 10091 转让群组
 */
const co = require('co');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      group_id: valid.string().required(),
      member_id: valid.string().required(),
    });
  },
  async getAction() {
    const group_id = this.query.group_id;
    const member_id = this.query.member_id;
    let result = await group_service.groupTransferOwner(group_id, member_id);
    if (result.errno == 0) {
      return this.success({ code: '200', msg: '' });
    } else {
      return this.success({ code: '1000', msg: result.errmsg });
    }
  }
}