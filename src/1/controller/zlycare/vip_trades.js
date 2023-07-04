/**
 * Created by fly on 2017－06－22.
 */

'use strict';
let _trade_service = Backend.service('1/zlycare', 'member_trade_service');
let _vip_service = Backend.service('1/zlycare', 'vip_service');
let _ = require('underscore');
module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {
      items: []
    });
  },
  mockAction: function () {
    var resObj = {
      items: [
        {
          title: 'vip全基因组测序',
          value: '-290.00元',
          createdAt: 1495766628831,
          certification_title: '300元报销凭证',
          certification_code: '23412412414',
          certification_for: '本凭证可用于全基因组测序报销',
          certification_use: '出示报销码即获取300元优惠',
          isChecked: false
        },{
          title: 'vip全基因组测序1',
          value: '-20.10元',
          createdAt: 1495766618831,
          certification_title: '300元报销凭证',
          certification_code: '23412412414',
          certification_for: '本凭证可用于全基因组测序报销',
          certification_use: '出示报销码即获取300元优惠',
          isChecked: true
        },{
          title: 'vip全基因组测序2',
          value: '-5.60元',
          createdAt: 1492765628831,
          certification_title: '300元报销凭证',
          certification_code: '23412412414',
          certification_for: '本凭证可用于全基因组测序报销',
          certification_use: '出示报销码即获取300元优惠',
          isChecked: false
        },{
          title: 'vip全基因组测序3',
          value: '+300.00元',
          createdAt: 1492765618831,
          certification_title: '300元报销凭证',
          certification_code: '23412412414',
          certification_for: '本凭证可用于全基因组测序报销',
          certification_use: '出示报销码即获取300元优惠',
          isChecked: false
        },{
          title: 'vip全基因组测序4',
          value: '+100.00元',
          createdAt: 1492765608831,
          certification_title: '300元报销凭证',
          certification_code: '23412412414',
          certification_for: '本凭证可用于全基因组测序报销',
          certification_use: '出示报销码即获取300元优惠',
          isChecked: true
        },
      ]
    }
    return this.success(resObj);
  },
  getAction: function () {
    let _self = this;
    let req = this.req;
    let options = getCurrentPageSlice(req, 0, 20, {createdAt: -1});
    let trades = [];
    return _trade_service.getVipMembershipTrades(req.userId, 'zlycare_vip', options)
      .then(function(_trades) {
        trades = JSON.parse(JSON.stringify(_trades));
        let product_ids = trades.map(function (_trade) {
          return _trade && _trade.productId || null;
        })
        return _vip_service.getVipProducts(product_ids);
      })
      .then(function(_products){
        let prodMap = _.indexBy(_products || [], '_id');
        trades = trades.map(function(_trade){
          let trade = {};
          trade.title = _trade.productName || '';
          trade.value = '-¥' + _trade.value;
          trade.createdAt = _trade.createdAt;
          // trade.certification_title = _trade.value + '元报销凭证';
          trade.certification_title = _trade.value + '元报销券';
          trade.certification_code = _trade.code;
          // trade.certification_for = '本凭证可用于' + (_trade.productName || '') + '报销';
          // trade.certification_use = '出示报销码即获取' + _trade.value + '元优惠';
            trade.certification_for = '此券可用于报销“ '+(_trade.productName || '') + '”';
            trade.certification_use = '商家扫码后，可为你报销'+ _trade.realPrice + '元';
          trade.certification_phone = prodMap[_trade.productId + ''] && prodMap[_trade.productId + ''].servicePeopleCall || '';
          trade.isChecked = _trade.isChecked || false;
          trade.step = _trade.step||0;
          trade.qrUrl = webHOST + qrToPath + '?zlycareCode=' + _trade.code;
          return trade;
        })
        return _self.success({items: trades});
      })
  }
}

