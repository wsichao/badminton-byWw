const mcShareService = Backend.service('mc_weapp', 'share');
const _ = require("underscore");
const userMode = Backend.model('common', undefined, 'customer');

module.exports = {
  async getAction() {
    const user_id = this.req.identity.userId;
    const ref_list = await mcShareService.getUserCareRef(user_id);

    return this.success({
      code: "200",
      msg: "",
      items: ref_list
    });
  }
}