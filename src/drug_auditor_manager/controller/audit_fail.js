/**
 * Created by Mr.Carry on 2018/3/12.
 */
"use strict";
const co = require('co');
const drug_auditor_service = Backend.service('drug_auditor_manager', 'drug_auditor');

module.exports = {
  // 检查用户是否登录
  __beforeAction: function () {
    let self = this;
    if (!self.req.session.drug_auditor || !self.req.session.drug_auditor.drug_auditor_id) {
      return self.res.redirect('/drug_auditor_manager/index');
    }
    let drug_auditor_id = self.req.session.drug_auditor.drug_auditor_id;

    co(function*(){
      let dt = yield drug_auditor_service.get(drug_auditor_id);
      if (dt.auditState != 100){
        return self.res.redirect('/drug_auditor_manager/index');
      }
    })
  },
  getAction() {
    let self = this;
    let drug_auditor_id = self.req.session.drug_auditor.drug_auditor_id;
    let result = co(function* () {
      return yield drug_auditor_service.get(drug_auditor_id);
    });
    return self.display('drug_auditor_manager/audit_fail', result);
  }
};