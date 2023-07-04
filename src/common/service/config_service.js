/**
 * 获取配置信息
 * Created by fly on 2017－06－23.
 */

'use strict';
let _model = Backend.model('common', undefined, 'config');
let request = require('request');
module.exports = {
  getConfigInfoById: function (id) {
    return _model.findOne({_id: id}).exec();
  },
  /**
   * 发动态触发红包活动的信息
   * @returns {Promise|Promise.<T>}
   */
  getHeavenConfigInfo: function () {
    let _id = '59636d8db1bce56941cdf067';
    let resObj = {
      isActive: false, //活动是否active
      isInviteActive: false, //邀请活动是否active
      limitPerDay: 0, //每天限制触发发红包的最大次数
      timesPerPeoplePerDay: 0, //每个人每天可以领取该活动红包的次数
      inviterRewardLimit: 0, //邀请者有奖,最大限制10人
      hongbaoValue: 0, //触发的红包的金额
      inviteValue: 0 //邀请用户成功时奖励的金额
    }
    return _model.findOne({_id: _id}).exec()
      .then(function (_res) {
        if (!_res || !_res.field) {
          return resObj;
        }
        let field = _res.field;
        let expiredAt = field.expiredAt || 0;
        let inviteExpiredAt = field.inviteExpiredAt || 0;
        let nowTS = Date.now();
        let isActive = nowTS < expiredAt ? true : false;
        let isInviteActive = nowTS < inviteExpiredAt ? true : false;
        return {
          isActive: isActive,
          isInviteActive: isInviteActive,
          limitPerDay: field.limitPerDay || 0,
          timesPerPeoplePerDay: field.timesPerPeoplePerDay || 0,
          inviterRewardLimit: field.inviterRewardLimit, //邀请者有奖,最大限制10人
          hongbaoValue: field.hongbaoValue || 0,
          inviteValue: field.inviteValue || 0
        };
      });
  },
  /**
   * app 首屏加载页配置信息
   */
    getLoadingPageConfigInfo(){
    let deferred = Backend.Deferred.defer();
    request({
      url: Backend.config.getConfig(Backend.type).ssp_url + '/inner/getAdInfo',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({'source': '24', 'tagId': 'inner_1001'})
    }, function (err, res, body) {
      deferred.resolve(body);
    })
    return deferred.promise.then(function (res) {
      res = JSON.parse(res);
      if (res.status == 1 && res.result != null) {
        return {
          img_url: res.result.main,
          value: res.result.ldp,
          type: 0
        };
      }
      else {
        let _id = '59672fdfb1bce56941cdf2ea';
        return _model.findOne({_id: _id}).then(re=> {
          return re.field;
        });
      }
    })
  },
  /**
   * 切换支付方式
   */
    getPayType(v){
    let _id = '596f3734b1bce56941cdf4fb';
    return _model.findOne({_id: _id}).then(re=> {
      if (re.field.v == v) {
        return re.field;
      }
      else {
        return {
          "is_ios_pay": false,
          "v": v
        }
      }
    });
  },
  /**
   * 获取医疗专区可售卖城市
   * @returns {Promise|Promise.<T>}
   */
  getZlycareCities: function () {
    let _id = '5976ae2fb1bce56941cdf676';
    return _model.findOne({_id: _id}).exec()
      .then(function (_config) {
        return _config && _config.field && _config.field.productSalesArea || [];
      });

  },
  getTagsByUserId: function (userId) {
    let _id = '59773d44b1bce56941cdf6c6';
    return _model.findOne({_id: _id}).exec()
      .then(function (_config) {
        let tags = [];
        if (_config && _config.field && _config.field.tagItems) {
          for (var i = 0; i < _config.field.tagItems.length; i++) {
            if (_config.field.tagItems[i].userId == userId) {
              tags = _config.field.tagItems[i].tags;
              break;
            }
          }
        }
        return tags;
      })
  },
  /**
   * 获取运营号配置
   * @returns {*|Promise.<T>}
   */
  getZlycareUser: function () {
    let _id = '59773d44b1bce56941cdf6c6';
    return _model.findOne({_id: _id}).exec()
      .then(function (res) {
        return res.field.tagItems
          .map(item => item.userId)
      })
  }
}