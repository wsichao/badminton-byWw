/**
 * api 10085 编辑群组信息
 */
const group_service = Backend.service('im', 'group');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      group_id: valid.string().required(),
      // group_name: valid.string().empty(''),
      // group_desc: valid.string().empty(''),
    });
  },
  async postAction() {
    let that = this;
    const group_id = this.post.group_id;
    const group_name = this.post.group_name + '';
    const group_desc = this.post.group_desc + '';

    const result = await group_service.editGroupInfo({
      group_id,
      group_name,
      group_desc
    });
    if (result.errno == 0) {
      return that.success({
        code: '200',
        msg: ''
      });
    } else {
      return that.success({
        code: '1000',
        msg: result.errmsg
      });
    }
  }
}