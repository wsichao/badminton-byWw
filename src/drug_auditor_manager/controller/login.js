/**
 * Created by Mr.Carry on 2018/3/12.
 */
"use strict";

const co = require('co');
const drug_auditor_service = Backend.service('drug_auditor_manager', 'drug_auditor');


module.exports = {
  __rule: function (valid) {
    return valid.object({
      channel_id: valid.string(),
      channel_name: valid.string()
    });
  },
  getAction() {
    let self = this;
    let drug_auditor_id = self.req.session.drug_auditor.drug_auditor_id;
    // drug_auditor_id = '5aa9e9e5bdd40f752b6e030q';
    let result = co(function* () {
      let dt = {};

      if (drug_auditor_id) {
        dt = yield drug_auditor_service.get(drug_auditor_id);
      }
      dt['phone'] = self.query['phone'] ? self.query['phone'] : dt['phone'];
      dt['name'] = self.query['name'] ? self.query['name'] : dt['name'];

      dt['channel_id'] = self.query['channel_id'] ? self.query['channel_id'] : dt['channel_id'];
      dt['channel_name'] = self.query['channel_name'] ? self.query['channel_name'] : dt['channel_name'];
      dt['province'] = self.query['province'] ? self.query['province'] : dt['province'];
      dt['city'] = self.query['city'] ? self.query['city'] : dt['city'];
      dt['county'] = self.query['county'] ? self.query['county'] : dt['county'];
      dt['show_name'] = (dt['channel_name']) || '';

      //检查用户状态值为非100时才可重新提交
      if (dt.auditState != 200) {
        return dt;
      } else {
        self.res.redirect('/drug_auditor_manager/index');
      }
    });

    return self.display('drug_auditor_manager/login', result);
  }

};