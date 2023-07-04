/**
 * 前端 web view 路由控制
 */
var
  router = require('express').Router();
  Open = require('../../controllers/OpenPageController');

router.get("/momentsHistory", Open.momentsHistoryInit);

router.get("/hongbaoInfo", Open.getRedPacketInfo);

router.get("/myHongbaoInfo", Open.myHongbaoInfo);


router.get("/business_coupon/received_coupon", Open.receivedCoupon);

router.get("/get_coupon", Open.getDiscountCoupon);


router.get("/profileInfoPresent",Open.profileInfoPresent)

router.get("/member-recharge/member_recharge.html",Open.memberRecharge)

router.get("/activity/activity24",Open.activity24);

router.get("/member-recharge/member_recharge.html/spring_outing",Open.springOuting)

router.get("/activity/activity24threeDays",Open.threeDays)

router.get("/activity/activity24member_recharge.htmlMayActivity",Open.mayActivity)

//170526活动
router.get("/activity/activity24keepAlive",Open.keepAlive0526)
module.exports = router;