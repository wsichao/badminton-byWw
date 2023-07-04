/**
 * 统计服务相关路由
 * TODO: 1. 统计接口控制访问权限,限制调用IP
 * TODO: 2. 限制访问频率
 */
var
  VERSION = "/1",
  router = require('express').Router(),
  Operation = require('../../controllers/OperationController'),
  ipAuth = require('../../../lib/middleware/IpLimit').ipLimit();

// 每晚统计-医生的-首次收藏的-推荐人, 新增或修改拉粉关系表
router.get(VERSION + "/statistic/relFansInviter", ipAuth, Operation.countTodayFansInviter);
// 每晚统计-医生的-首次收藏的-推荐人, 新增或修改拉粉关系表
router.get(VERSION + "/statistic/relFansReferrer", ipAuth, Operation.countTodayFansReferrer);
// 每晚统计并奖励D下面的 Top1 A; 奖励以D购买A的广告位的形式;
router.get(VERSION + "/statistic/rewardTopA", ipAuth, Operation.getTopFansAndReward);
// 每晚统计D的介绍人和发展人;
router.get(VERSION + "/statistic/operator", ipAuth, Operation.setIntroducer);
// 每日24时后，将当日的关键运营数据以短信的形式定向发给部分手机号
router.get(VERSION + "/statistic/dailyOPStatistic", ipAuth, Operation.dailyOPStatistic);

//热线号8开头,建立搜索
router.get(VERSION + "/statistic/setNameSearch",ipAuth, Operation.setNameSearch);
router.get(VERSION + "/statistic/setOccupationSearch",ipAuth, Operation.setOccupationSearch);
router.get(VERSION + "/statistic/setFieldSearch",ipAuth, Operation.setFieldSearch);
//建立用户关系 仅关系初始化使用!!
//router.get(VERSION + "/statistic/buildRel",ipAuth, Operation.buildRel);
//红包过期未领取
router.get(VERSION + "/statistic/hongbao/expiredRefund", ipAuth, Operation.expiredRefund);

//当天可能由于网络异常,包红包未发动态,红包退款失败
router.get(VERSION + "/statistic/hongbao/expiredRefundWithoutMoment", ipAuth, Operation.expiredRefundWithoutMoment);

//用户领取了返利代金券,但未使用,2天后过期;过期的返利代金券,商家收回,饭给商家,忽略用户.
router.get(VERSION + "/statistic/backVenderTheExpired", ipAuth, Operation.backVenderTheExpired);

module.exports = router;