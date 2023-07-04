/**
 * Created by Mr.Carry on 2017/5/22.
 */
/**
 * Created by yichen on 2017/5/15.
 * 活动相关接口
 */
var
  VERSION = "/1",
  router = require('express').Router(),
  Activity = require('../../controllers/ActivityController');


// API-6001 20170524活动,领取优惠券
router.get(
  VERSION+"/zlycare/seniormember_page",function(req,res,next){
    "use strict";
    res.render("seniormembers/seniormember")
  });


module.exports = router;
