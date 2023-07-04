/**
 * Created by Mr.Carry on 2017/7/13.
 */
"use strict";
let config_service = Backend.service('common', 'config_service');

module.exports = {
  getAction: function () {
    // return this.success(config_service.getLoadingPageConfigInfo());
    return this.success({
      "img_url": "",
      "type": 0,
      "value": ""
    })
  },
  mockAction: function () {
    return this.success({
      "img_url": "https://dev.mtxhcare.com/new_activity/images/share/newper_10.png",
      "type": 0,
      "value": "https://dev.mtxhcare.com/new_activity/activity_invite.html"
    });
  }
};