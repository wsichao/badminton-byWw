/**
 * 用户会员额度（新）卡包
 * Created by yichen on 2017/6/20.
 */


'use strict';
let _ = require('underscore');
module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {
      items: []
    });
  },
  mockAction: function () {
    var resObj = {
      isVersionPass : true , //审核有没有通过
      items : [
        {
          type : 'city_buy',
          title : '全城购物会员卡',
          subTitle : '',
          totalVal : 1000.00, //会员额度总额
          balance : 800.00, //剩余额度
          membershipVals : [  //会员卡列表
            {
              title:'会员额度', //会员卡title，
              subTitle :'',//会员卡subTitle
              benefitVal: 300,//会员卡面值
              cost: 25,//实际消费金额
              cardNo: '1111',//卡号
              expiredTime :90 * 24 * 60 * 60 * 1000 //过期时间
            }
          ]
        },
        {
          type : 'zlycare',
          title : '朱李叶健康高级会员卡',
          subTitle : '',
          totalVal : 1000, //会员额度总额
          balance : 800, //剩余额度
          membershipVals : [  //会员卡列表
            {
              title:'高级会员', //会员卡title，
              subTitle :'',//会员卡subTitle
              benefitVal: 300,//会员卡面值
              cost: 25,//实际消费金额
              cardNo: '1111',//卡号
              expiredTime :90 * 24 * 60 * 60 * 1000 //过期时间
            }
          ]
        },
        {
          type : 'zlycare_vip',
          title : '朱李叶健康VIP会员卡',
          subTitle : '',
          totalVal : 1000, //会员额度总额
          balance : 800, //剩余额度
          membershipVals : [ //会员卡列表
            {
              title:'vip会员', //会员卡title，
              subTitle :'',//会员卡subTitle
              benefitVal: 300,//会员卡面值
              cost: 25,//实际消费金额
              cardNo: '1111',//卡号
              expiredTime :90 * 24 * 60 * 60 * 1000 //过期时间
            }
          ]
        }

      ],
    }
    return this.success(resObj);
  },
  getAction: function () {
    console.log("come in");
    var that = this;

    var userId = this.req.identity.userId;
    var user = this.req.identity.user;
    var version = this.req.identity.appVersion;
    if (!isUUID24bit(userId) || !isExist(user)) {
      return that.fail(8005);
    }
    let MembershipService = Backend.service('1/membership','membership_card');
    let VersionService = Backend.service('common','version_service')
    var resData = {};
    return MembershipService.getUserMembershipInfo(userId, user.hasBoughtSenior || false)
      .then(function(_info) {
        resData.items = JSON.parse(JSON.stringify(_info));
        return VersionService.findVersion({name: "v" + version})
      })
      .then(function(_version){
        resData.isVersionPass = (_version.length > 0);
        return that.success(resData);
      }, function (err) {
        console.log(err);
        commonResponse(that.res, 400, {code:err.code, msg:err.message}, null);
      })

  }
}
