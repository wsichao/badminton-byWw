const commonUtil = require('../../../lib/common-util');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      id: valid.string().empty(""),
      phone: valid.string().empty(""),
      params: valid.string().empty("")
    });
  },
  async postAction() {
    const id = this.post.id;
    const phone = this.post.phone;
    const params = this.post.params;
    console.log(`${id} ${phone} ${params}`);
    commonUtil.sendSms(id, phone, `${params}`);
    return this.success({
      code: "200",
      msg: ""
    })
  }
}