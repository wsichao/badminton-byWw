const drug_coupon_model = Backend.model('activity', undefined, 'drug_coupon');
const drug_auditor_model = Backend.model('drug_auditor_manager', undefined, 'drug_auditor');

module.exports = {
  /**
   * 生成药品优惠券
   * @param couponId
   * @param activity 活动全部信息
   * @returns {Promise}
   */
  createDrugCoupon: function (userId, couponId, activity) {
    if (!activity || !activity._id) {
      return Promise.reject('活动不存在');
    }
    // const baseUnionCode = '1526366300';
    const UNION_CODE_AUTH_INC_ID = '5afa82637aab995a74b711f1';
    const coupon = {};
    couponId = couponId || getNewObjectId();
    return drug_coupon_model.findByIdAndUpdate(UNION_CODE_AUTH_INC_ID, {$inc: {unionCode: 1}}).exec()
    .then(function (_coupon) {
      coupon._id = couponId;
      coupon.userId = userId;
      coupon.activityId = activity._id;
      coupon.activity = activity;
      coupon.unionCode = _coupon.unionCode + '' + getRandomNum(10, 99);
      console.log(_coupon.unionCode, coupon.unionCode);
      return drug_coupon_model.create(coupon);
    });
  },
  /**
   * 通过ID获取优惠券信息
   * @param id
   * @returns {Promise|void|Query|*}
   */
  getDrugCouponById: function (id) {
    return drug_coupon_model.findOne({_id: id, isDeleted: false});
  },
  /**
   * 通过unionCode获取优惠券信息
   * @param unionCode
   * @returns {Promise|void|Query|*}
   */
  getDrugCouponByUnionCode: function (unionCode) {
    return drug_coupon_model.findOne({unionCode: unionCode, isDeleted: false});
  },
  /**
   * 返回用户的所有优惠券
   * 有效的优惠券排在前面
   * @param userId ObjectId
   */
  getDrugCouponsByUserIdNew: function (userId, pagination) {
    const $match = {userId: userId, isDeleted: false};
    const $project = {activity: 1, isConsumed: 1, unionCode: 1, time: {$subtract : ['$activity.couponEndTime', Date.now()]}};
    const $sort = { isConsumed: 1, time: -1};
    const $skip = pagination.skip;
    const $limit = pagination.limit;
    const $aggregate = [
      {$match: $match},
      {$project: $project},
      {$sort: $sort},
      {$skip: $skip},
      {$limit: $limit},
    ];
    return drug_coupon_model.aggregate($aggregate).exec();
  },
  /**
   * 返回用户的所有优惠券
   * @param userId
   */
  getDrugCouponsByUserId: function (userId, fields, pagination) {
    return drug_coupon_model.find({userId: userId, isDeleted: false}, fields || '', pagination || {});
  },
  /**
   * 店员收券
   * @param couponId 优惠券ID
   * @param auditorId 店员ID
   */
  consumeCoupon: function (couponId, auditorId) {
    return drug_coupon_model.update({_id: couponId, isDeleted: false}, {
      $set: {
        isConsumed: true,
        consumedBy: auditorId,
        consumedAt: Date.now()
      }
    });
  },
  /**
   * 检查用户是否为店员
   * @param phoneNum
   * @returns {Promise}
   */
  checkAuditor: function (phoneNum) {
    const cond = {
      isDeleted: false,
      auditState: 200,
      phone: phoneNum
    };
    return drug_auditor_model.findOne(cond).exec()
    .then(function (auditor) {
      if (auditor) return true;
      return false;
    })
  },

  /**
   * 返回用户的未使用的优惠券
   * 券未被使用、且未过期、未被删除
   * @param userId
   */
  getUnusedDrugCouponsByUserId: function (userId) {
    let now = Date.now();
    return drug_coupon_model.find({
      userId: userId,
      isConsumed: false,
      // 'activity.couponStartTime': {$lte: now},
      'activity.couponEndTime': {$gte: now},
      isDeleted: false
    });
  }
}