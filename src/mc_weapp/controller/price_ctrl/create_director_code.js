const mcDirectorInviteCodeModel = Backend.model('mc_weapp', undefined, 'mc_directorInvite_code');
const uuid = require('uuid');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      num: valid.number().default(1),
      pwd: valid.string().required()
    });
  },
  /**
   * 生成邀请码
   */
  async getCode() {
    const code = uuid.v4();
    return code.split('-')[0].substring(0, 6);
  },
  /**
   * 检查该邀请码是否已经存在
   */
  async checkUsed(code) {
    const count = await mcDirectorInviteCodeModel.count({
      code,
      isDeleted: false
    });
    return count > 0;
  },
  async saveCode(code) {
    await mcDirectorInviteCodeModel.create({
      code
    })
  },
  async createCode() {
    const code = await this.getCode();
    const flag = await this.checkUsed(code);
    if (flag) {
      return createCode();
    }
    await this.saveCode(code);
    return code;
  },
  async getAction() {
    const pwd = this.query.pwd;
    if (pwd != 'zlycare2019') {
      return this.success({
        code: "1000",
        msg: "错误！！！"
      })
    }

    try {
      const num = this.query.num;
      let codes = [];
      for (let i = 0; i < num; i++) {
        const code = await this.createCode();
        codes.push(code);
      }
      return this.success({
        code: "200",
        msg: "",
        codes
      })
    } catch (e) {
      console.log("----------------生成邀请码失败 start------------------")
      console.log(e);
      console.log("----------------生成邀请码失败  end ------------------")
      return this.success({
        code: "1000",
        msg: "生成邀请码失败，请查看系统日志"
      })
    }



  }
}