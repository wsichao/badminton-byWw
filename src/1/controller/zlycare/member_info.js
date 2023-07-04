/**
 * Created by fly on 2017－06－24.
 */
"use strict";
let _membership_service = Backend.service('1/membership', 'membership_card');
module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {
      value: 0
    });
  },
  mockAction: function () {
    let resObj = {
      value: 500
    }
    return this.success(resObj);
  },
  getAction: function () {
    let _self = this;
    let req = this.req;
    let type = req.query.type;
    if(!type){
      return this.fail(8005);
    }
    let typeMap = {
      'senior': 'zlycare',
      'vip': 'zlycare_vip'
    }
    let resObj = {
      value: 600
    }
    return _membership_service.getVipMembershipBalance(req.userId, typeMap[type] || type)
    .then(function(_res){
      return _self.success({
        value: _res && _res[0] ?  (_res[0].balance || 0) : -1,
          normalValue: _res && _res[0] ?  (_res[0].normalValue || 0) : -1
      });
    })
  }
}