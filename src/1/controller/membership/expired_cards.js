/**
 * Created by fly on 2017－05－25.
 */
'use strict';
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
          totalValue: 100,
          balance: 50,
          cost: 50,
          validAt: 1495692215929,
          expiredAt: 1495697215929,
          cardNo: '2017050300000',
        },{
          totalValue: 100,
          balance: 50,
          cost: 50,
          validAt: 1495692215929,
          expiredAt: 1495697215929,
          cardNo: '2017050300001',
        },{
          totalValue: 100,
          balance: 50,
          cost: 50,
          validAt: 1495692215929,
          expiredAt: 1495697215929,
          cardNo: '2017050300001',
        },{
          totalValue: 200,
          balance: 50,
          cost: 150,
          validAt: 1495692215929,
          expiredAt: 1495697215929,
          cardNo: '2017050300001',
        },{
          totalValue: 100,
          balance: 50,
          cost: 50,
          validAt: 1495692215929,
          expiredAt: 1495697215929,
          cardNo: '2017050300001',
        },
      ]
    }
    return this.success(resObj);
  },
  getAction: function () {
    let nowTS = Date.now();
    let todayBeginTS = new Date(getDateMidnight(nowTS)).getTime();
    let _service = Backend.service('1/membership', 'membership_card');
    let _req = this.req;
    let user_id = _req.userId;
    var cardType = _req.query.cardType || 'city_buy';
    console.log(todayBeginTS, user_id);
    let card_promise = _service.getExpiredMembershipCards(user_id , cardType)
      .then(function(_memberships){
        return {
          items: _memberships
        }
      }, function (err) {
        console.log(err);
      });
    return this.success(card_promise);
  }
}