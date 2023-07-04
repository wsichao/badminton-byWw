const mcUserInfoModel = Backend.model('mc_weapp', undefined, 'mc_user_info');
const mcDirectorInviteCodeModel = Backend.model('mc_weapp', undefined, 'mc_directorInvite_code');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      code: valid.string().max(6).required()
    });
  },
  async checkUser(user_id) {
    const count = await mcUserInfoModel.count({
      userId: user_id,
      isDeleted: false,
      role: "director"
    })
    return count > 0;
  },
  async checkBeCode(code) {
    const count = await mcDirectorInviteCodeModel.count({
      code,
      isDeleted: false,
    })
    return count == 0;
  },
  async checkCode(code) {
    const count = await mcDirectorInviteCodeModel.count({
      code,
      isDeleted: false,
      isUsed: false
    })
    return count == 0;
  },
  async updateUserInfo(user_id, code) {
    await mcUserInfoModel.update({
      userId: user_id,
      isDeleted: false
    }, {
      role: "director"
    });
    await mcDirectorInviteCodeModel.update({
      code,
      isDeleted: false
    }, {
      isUsed: true,
      usedTime: Date.now(),
      userId: user_id
    })
  },
  async getAction() {
    const user_id = this.req.identity.userId;
    const code = this.query.code;
    let msg_code = '200'
    let msg = '';

    if (await this.checkUser(user_id)) {
      msg_code = '1000'
      msg = '该用户已是主管，请勿重复提交'
    } else if (await this.checkBeCode(code)) {
      msg_code = '1000';
      msg = "邀请码不存在，请提交新的邀请码";
    } else if (await this.checkCode(code)) {
      msg_code = '1000';
      msg = "邀请码已被使用，请提交新的邀请码"
    }

    if (msg_code == '1000') {
      return this.success({
        msg_code,
        msg
      })
    }

    await this.updateUserInfo(user_id, code);

    return this.success({
      code: "200",
      msg: ""
    })
  }
}