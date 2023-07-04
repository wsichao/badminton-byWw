/**
 *
 * 活动详情
 *
 * Created by yichen on 2018/5/16.
 */
'use strict';
const co = require('co');
const drug_activity_model = Backend.model('activity', undefined,'drug_activity');
const drug_coupon_model = Backend.model('activity', undefined,'drug_coupon');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      activity_id: valid.string().required(),
    });
  },
  getAction(){
    let query = this.query;
    let user_id = this.req.identity.userId;
    const result =  co(function* (){
      let drug_activity = yield drug_activity_model.findOne({_id:query.activity_id,isDeleted:false});
      drug_activity = JSON.parse(JSON.stringify(drug_activity));
      let coupon;
      if(user_id) {
        coupon = yield drug_coupon_model.findOne({
          userId: user_id,
          activityId: query.activity_id,
          isConsumed: false,
          'activity.couponEndTime':{$gte : Date.now()}
        });
      }
      drug_activity.isReceived = false;
      if(coupon){
        drug_activity.isReceived = true;
        drug_activity.couponCode = coupon.unionCode || '';
      }
      return {
        code: '200',
        msg: '',
        data: drug_activity
      }
    });

    return this.success(result);

  }
};