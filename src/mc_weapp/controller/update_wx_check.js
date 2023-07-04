const mc_wx_check_model = Backend.model('mc_weapp', undefined, 'mc_wx_check');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      v: valid.string().default("1.0"),
      status: valid.number().default(200)
    });
  },
  async getAction() {
    const v = this.query.v;
    const status = this.query.status;
    await mc_wx_check_model.update({
      version: {
        $ne: v
      }
    }, {
      status: 200,
      isDeleted: false
    }, {
      multi: true
    })
    const result = await mc_wx_check_model.update({
      version: v
    }, {
      status,
      isDeleted: false
    }, {
      upsert: true
    });
    return this.success({
      result
    })
  }
}