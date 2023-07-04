/**
 *
 * 领取优惠券
 *
 * Created by yichen on 2018/5/16.
 */
'use strict';
const co = require('co');
 const drug_coupon_service = Backend.service('activity', 'drug_coupon');
 const drug_activity_service = Backend.service('activity', 'drug_activity');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      activity_id: valid.string().required(),
    });
  },
  mockAction(){
    let resObj = {
      code: '200',
      msg: ''
    };
    return this.success(resObj);
  },
  postAction(){
    let resObj = {
      code: '200',
      msg: ''
    };
    const post = this.post;
    let user_id = this.req.identity.userId;
    const result =  co(function* (){
      let activity = yield drug_activity_service.judgeActivity(post.activity_id,post.article_code,user_id);
      if(activity && activity._id){
        let coupon = yield drug_coupon_service.createDrugCoupon(user_id,undefined,activity);
        if(coupon){
          resObj.data = {
            "_id": coupon._id,
            "unionCode": coupon.unionCode,
            "tag": activity.tag || '',
            "name": activity.name || '',
            "img": activity.imgs && activity.imgs[0] || '',
            "couponStartTime": activity.couponStartTime,
            "couponEndTime": activity.couponEndTime,
            "desc": activity.desc || '',
            "drugstore":  activity.drugstore || ''
          };
          return resObj;
        }
      }else{
        return activity
      }
    });
    return this.success(result);
  }
};