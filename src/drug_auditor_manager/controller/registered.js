/**
 * Created by Mr.Carry on 2018/3/12.
 */
"use strict";
const co = require('co');
const drug_auditor_service = Backend.service('drug_auditor_manager', 'drug_auditor');

module.exports = {
  // 前置触发器
  __beforeAction: function () {
    const drug_auditor = this.req.session.drug_auditor;
    if (!drug_auditor) {
      return this.fail('请通过微信端登录');
    }
  },
  __rule: function (valid) {
    return valid.object({
      name: valid.string().required(),
      phone: valid.string().required(),
      channel: valid.string().required(),
    });
  },
  postAction() {
    const drug_auditor = this.req.session.drug_auditor;
    const phone = this.post.phone;
    const id = this.post.id;
    const name = this.post.name;
    const channel = this.post.channel;
    const open_id = drug_auditor.open_id;
    const nickname = drug_auditor.name;
    const avatar = drug_auditor.avatar;
    let result = co(function* () {
      let user = {};
      //check id存在则
      if (drug_auditor.drug_auditor_id == id) {
        // 拒绝理由置空
        const refuseReason = '';
        yield drug_auditor_service.update(id, phone, name, channel, refuseReason);
        user._id = id;
      } else {
        user = yield drug_auditor_service.register(phone, name, channel, open_id, nickname, avatar);
      }

      return { id: user._id };
    });
    return this.success(result);
  }
};