const mcShareService = Backend.service('mc_weapp', 'share');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  async getAction() {
    const user_id = this.query.user_id;
    const ref_list = await mcShareService.getSubUserRef(user_id);

    return this.success({
      code: "200",
      msg: "",
      items: ref_list
    });
  }
}