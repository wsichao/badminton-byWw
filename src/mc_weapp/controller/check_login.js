const mc_wx_check_model = Backend.model('mc_weapp', undefined, 'mc_wx_check');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      v: valid.string().default("1.0")
    });
  },
  async getAction() {
    const v = this.query.v;
    let check_login = false;
    const result = await mc_wx_check_model.count({
      isDeleted: false,
      version: v,
      status: 100
    });
    if (result > 0) {
      check_login = true;
    }
    return this.success({
      check_login
    })
  }
}