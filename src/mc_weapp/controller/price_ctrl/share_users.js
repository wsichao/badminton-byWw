const mcShareService = Backend.service('mc_weapp', 'share');
module.exports = {
  async getAction() {
    const user_id = this.req.identity.userId;
    const ref_list = await mcShareService.getUserRef(user_id);

    return this.success({
      code: "200",
      msg: "",
      items: ref_list
    });
  }
}