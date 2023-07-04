const model = Backend.model('mc_weapp', undefined, 'mc_partner_applyfor');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      phone_num: valid.string().regex(/^1[3456789]\d{9}$/).required(),
      name: valid.string().required(),
    });
  },
  async postAction() {
    try {
      const phone_num = this.post.phone_num;
      const name = this.post.name;

      await model.create({
        phoneNum: phone_num,
        name
      })
      return this.success({
        code: '200',
        msg: '提交成功'
      })
    } catch (e) {
      console.log(e);
      return this.success({
        code: '1000',
        msg: '系统错误,提交失败'
      })
    }
  }
}