/**
 * Created by Mr.Carry on 2018/3/12.
 */
"use strict";
module.exports = {
  // 检查用户是否登录
  __beforeAction: function () {
    if (!this.req.session.drug_auditor || !this.req.session.drug_auditor.drug_auditor_id) {
      return this.res.redirect('/drug_auditor_manager/index');
    }
  },
  getAction() {
    return this.display('drug_auditor_manager/audit', {});
  }
};