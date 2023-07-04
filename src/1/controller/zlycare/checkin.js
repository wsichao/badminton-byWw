/**
 * Created by fly on 2017－07－13.
 */
'use strict';
let trade_service = Backend.service('1/zlycare', 'member_trade_service');
let message_service = Backend.service('1/message', 'messages');
let user_service = Backend.service('common', 'user_service');
module.exports = {
  __beforeAction: function () {
    if(!isUserInfoAuthorized(this.req)){
      return this.fail(8005);
    }
  },
  mockAction: function () {
    let resObj = {
    }
    return this.success(resObj);
  },
  postAction: function () {
    let self = this;
    let req = self.req;
    let user = req.user;
    let trade_id = req.body.trade_id || '';
    if(!trade_id){
      return this.fail(8005);
    }
    let resObj = {
    }
    let trade = null;
    let buyer = null;
    return trade_service.getTradeById(trade_id)
    .then(function(_trade){
      if(!_trade){
        throw getBusinessErrorByCode(2100);
      }
      trade = _trade;
      //判断是不是医疗商户
      if((user.shopVenderApplyStatus < 3) || (user.shopType != '医疗')){
        throw getBusinessErrorByCode(2417);
      }
      if(_trade.step==2){
          throw getBusinessErrorByCode(2416);
      }else if(_trade.step==1){
          throw getBusinessErrorByCode(2418);
      }
      if(_trade.isChecked){
        throw getBusinessErrorByCode(2416);
      }
      return trade_service.setTradeChecked(_trade._id, user._id);
    })
    .then(function(){
      return user_service.getInfoByUserId(trade.userId, 'pushId name avatar');
    })
    .then(function(_buyer) {
      console.log('_buyer:', _buyer);
      if (!_buyer) {
        throw getBusinessErrorByCode(2403); //todo:
      }
      buyer = _buyer;
    })
    .then(function(){
      resObj = {
        price: trade.value || 0,
        payerName: buyer.name || '',
        payerAvatar: buyer.avatar || '',
          productName:trade.productName||''
      }
      var name = user.shopVenderApplyStatus >= 3 ? user.shopName || user.name || '' : user.name || '';
      var avatar = user.shopVenderApplyStatus >= 3 ? user.shopAvatar || user.avatar || '' : user.avatar || '';
      var extras = {
        type: 1,
        contentType: 'zlycare_checkin_success', //商家收券成功
        contentObj: { //
          orderId: '', //订单号
          price: trade.value, //订单金额
            productName:trade.productName,//药品名称
          //商家收券成功,透传给用户的信息
          payment: trade.value || 0, //支付金额
          shopName: name, //收款人姓名
          shopAvatar: avatar, //收款人头像
          customerReward:  0, //返现额度
          unionCode: ''
        }
      };
      console.log('extras:', extras);
      message_service.pushMessage(buyer.pushId, '', extras);
      console.log('这是一个商品',resObj);
      return self.success(resObj);
    }, function(e){
      console.log('err-' + e.code + ':' + e.message);
      return self.fail(e.code);
    })
  }

}