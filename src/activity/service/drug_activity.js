const drug_activity_model = Backend.model('activity', undefined, 'drug_activity');
const drug_coupon_model = Backend.model('activity',undefined,'drug_coupon');
const co = require('co');
const _  = require('underscore');

module.exports = {
  /**
   * 获取活动信息
   * @param couponId
   * @returns {Promise}
   */
  getActivityById: function(activityId){
    return drug_activity_model.findOne({_id: id, isDeleted: false});
  },
  /**
   * 通过ids获取所有活动信息
   * @param activityIds
   */
  getActivityByIds: function(activityIds){
    return drug_activity_model.find({_id: {$in: activityIds}, isDeleted: false});
  },
  /**
   * 改活动优惠券能不能领取，能领取返回活动实体
   * @param activityId
   * @param article_code
   */
  judgeActivity : function (activityId,article_code,userId) {

    const result =  co(function* (){
      let activity =  yield drug_activity_model.findOne({_id: activityId, isDeleted: false});
      //判断活动有没有过期
      if(Date.now() > activity.endTime){
        return {
          code : '805',
          msg : '该活动已过期'
        };
      }
      //判断活动中券的数量
      let activity_coupon_count = yield drug_coupon_model.count({activityId:activityId,isDeleted:false});
      if(activity_coupon_count >= activity.couponCount){
        return {
          code : '808',
          msg : '该活动优惠券已领完'
        };
      }
      //判断用户当前如果领取过该优惠券并且没有使用
      let activity_coupon_user = yield drug_coupon_model.findOne({activityId:activityId,userId:userId,
        'activity.couponEndTime':{$gte : Date.now()},isConsumed:false,isDeleted:false});
      if(activity_coupon_user){
        return {
          code : '809',
          msg : '您已领取过该优惠券'
        };
      }
      //判断是不是需要阅读文章
      if(activity.couponType == 'article'){
        if(_.indexOf(activity.couponAndArticle, article_code) > -1){
          return activity;
        }else{
          return {
            code : '806',
            msg : '需要阅读文章'
          };
        }
      }else if(activity.couponType == 'activityList'){
        return activity
      }else{
        return {
          code : '807',
          msg : '活动类型不存在'
        };
      }
    });
    return result;
  },
  get_activity_area:function () {
    const result =  co(function* (){
      let activitys = yield drug_activity_model.aggregate([
        {$match : {isDeleted : false}},
        {
          $group : {
            _id : {
              province: "$province",
              provinceId: "$provinceId",
              city: "$city",
              cityId: "$cityId",
              district: "$district",
              districtId: "$districtId",
            },
          }
        }
      ]).exec();
      //console.log('------')
      //console.log(activitys);
      let result = [];
      activitys.forEach(function(item){
        result.push(item._id);
      })
      return result
    });
    return result;
  },
  /**
   * 根据文章id获取随机活动
   * @param article_id
   */
  get_random_avtivity_by_article:function (article_id) {
    const result =  co(function* (){
      let activity = yield drug_activity_model.find({couponType:'article',isDeleted:false,couponAndArticle:article_id}).limit(1)
      if(activity && activity.length){
        return activity[0]._id
      }else{
        return ''
      }

    });
    return result;
  }
};