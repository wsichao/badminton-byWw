/**
 * Created by fly on 2017－07－14.
 */

'use strict';
let trade_service = Backend.service('1/zlycare', 'member_trade_service');
let vip_service = Backend.service('1/zlycare', 'vip_service');
module.exports = {
  __beforeAction: function () {
    if(!isUserInfoAuthorized(this.req)){
      return this.fail(8005);
    }
  },
  mockAction: function () {
    var resObj = {
      trade_id: '59682c25330a05a4090188c7',
      certification_for: '可用于****报销',
      certification_value: 200,

    }
    return this.success(resObj);
  },
  getAction: function () {
    let self = this;
    let req = self.req;
    let user = req.user;
    let certification_code = req.query.certification_code || '';
    if(!certification_code){
      return this.fail(8005);
    }
    let trade = null;
    let product = null;
    return trade_service.getTradeByCode(certification_code)
      .then(function(_trade){
        if(!_trade){
          throw getBusinessErrorByCode(2100);
        }
        //判断是不是医疗商户
        if((user.shopVenderApplyStatus < 3) || (user.shopType != '医疗')){
          throw getBusinessErrorByCode(2417);
        }
          if(_trade.step==2){
              throw getBusinessErrorByCode(2416);
          }
        if(_trade.isChecked){
          throw getBusinessErrorByCode(2416);
        }
        trade = _trade;
        return vip_service.getVipProductInfo(trade.productId);
      })
      .then(function(_product){
        if(!_product)
          throw getBusinessErrorByCode(2410);
        product = _product;
      })
      .then(function(){
        return self.success({
          trade_id: trade._id + '',
          // certification_for: '可用于报销'  + (product.productName || ''),
            certification_for :'此券可用于报销“ '+(product.productName || '') + '”',
          certification_value: trade.value,
        });
      }, function(e){
        console.log('err-' + e.code + ':' + e.message);
        return self.fail(e.code);
      })
  }
}

