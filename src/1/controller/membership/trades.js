/**
 * Created by fly on 2017－05－25.
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
      items: [
        {
          title: '额度到期扣除',
          value: '-290.00元',
          createdAt: 1495766628831
        },{
          title: '用券现：老年餐厅',
          value: '-20.10元',
          createdAt: 1495766618831
        },{
          title: '领券：老年餐厅',
          value: '-5.60元',
          createdAt: 1492765628831
        },{
          title: '购买会员额度',
          value: '+300.00元',
          createdAt: 1492765618831
        },{
          title: '领取会员额度',
          value: '+100.00元',
          createdAt: 1492765608831
        },
      ]
    }
    return this.success(resObj);
  },
  getAction: function () {
    let _req = this.req;
    let user_id = _req.userId;
    let service = Backend.service('1/membership', 'membership_trade');
    let service_user = Backend.service('common', 'user_service');
    let options = getCurrentPageSlice(_req, 0, 20, {createdAt: -1});
    let trades = [];
    let trade_promise = service.getMembershipTrades(user_id, options)
    .then(function(_trades) {
      trades = _trades = JSON.parse(JSON.stringify(_trades));
      let shopIds = [];
      var types = ['coupon', 'rebate'];
      _trades.forEach(function (_trade) {
        if (types.indexOf(_trade.type) > -1 && _trade.shopId) {
          shopIds.push(_trade.shopId);
        }
      });
      return service_user.getInfoByUserIds(shopIds, 'shopName');
    })
    .then(function(_shops){
      //todo: _shops=[]
      //console.log(_shops);
      let shop_id_name_map = _.indexBy(_shops, '_id');
      //console.log(shop_id_name_map);
      let _format_trades = [];
      trades.forEach(function(_trade){
        _format_trades.push(service.formatMembershipTradeTitle(_trade, shop_id_name_map));
      });
      console.log(_format_trades);
      return {
        items: _format_trades
      }
    }, function(err){
      console.log(err);
    });
    return this.success(trade_promise);
  }
}
