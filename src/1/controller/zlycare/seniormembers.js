/**
 * Created by fly on 2017－05－22.
 */
"use strict";

module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {
      items: []
    });
  },
  getAction: function () {
    let resObj = {
      items: []
    }
    let seniorMembersService = Backend.service('1/zlycare', 'seniormembers');
    let result = seniorMembersService.getSeniorMembers().then(function (_resData) {
      return {items: _resData};
    })
    return this.success(result);
  }
}