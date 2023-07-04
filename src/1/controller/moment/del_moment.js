/**
 * 删除动态
 * Created by yichen on 2017/7/3.
 */

"use strict";
let service = Backend.service('1/moment', 'moment_service');

module.exports = {
  __beforeAction: function () {
    if (!isUserInfoAuthorized(this.req)) {
      return this.fail(8005);
    }
  },
  getAction: function () {
    console.log("come in del");
    let that  = this;
    let userId = this.req.identity.userId;
    let moment_id = this.query.moment_id;
    return service.delMoment(moment_id,userId)
      .then(function(_moment){
        if(_moment){
          return that.success({code:200});
        }else{
          return that.fail(8005);
        }
      })
  }

}