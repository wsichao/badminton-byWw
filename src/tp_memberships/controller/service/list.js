const member_service = Backend.service('tp_memberships', 'member_service');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      classification_id: valid.string().required(),
      page_size: valid.number().default(20),
      page_num: valid.number().default(0),
      user_id: valid.string()
    });
  },
  async getAction() {
    const classification_id = this.query.classification_id;
    const user_id = this.query.user_id;

    const page_size = this.query.page_size;
    const page_num = this.query.page_num + 1;
    const items = await member_service.list(classification_id, user_id, {
      page_num,
      page_size
    });
    return this.success({
      code: '200',
      msg: '',
      items
    });
  }
}