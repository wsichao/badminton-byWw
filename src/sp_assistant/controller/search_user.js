const service = Backend.service('sp_assistant', 'sale');

module.exports = {
  __rule: function (valid) {
    return valid.object({
        keyword: valid.string().required()
    });
  },
  async getAction() {
    let that = this;
    let keyword = that.query.keyword;
    let result = await service.get_users_by_keyword(keyword);
    return that.success(result);
  }
}