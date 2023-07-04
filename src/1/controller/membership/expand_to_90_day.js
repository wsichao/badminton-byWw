/**
 * 将未过期的会员额度,从购买之日起,有效期延长到90天
 * Created by fly on 2017－06－14.
 */

'use strict';

let service_membership = Backend.service('1/membership', 'membership_card');
let _model = Backend.model('1/membership', undefined,  'membership_card');
let async = require('async');
module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  getAction: function () {
    let nowTS = Date.now();
    let cond = {
      isDeleted: false,
      expiredAt: {$gt: nowTS},
    };
    console.log(cond);
    let errArray = [];
    let min_expired_time = 0;
    let validTS = 90 * 24* 60 * 60 * 1000;
    //let validTS_1 = 30 * 24* 60 * 60 * 1000;
    //let validTS_2 = 60 * 24* 60 * 60 * 1000;
    let promise_res  = _model.findOne(cond).sort({validAt: 1}).exec()
    .then(function(_membership){
      min_expired_time = getDateBeginTS(_membership.validAt) + validTS - 1;
      let hasData = true;
      async.whilst(
        function () {
          return hasData;
        },
        function (cb) {
          //cond.userId = '5819ed2593740e996bf3f824';
          cond.expiredAt = { $lt: min_expired_time, $gt: nowTS }
          //cond.expiredAt = {$gte: min_expired_time }
          console.log(cond);
          let membership = null;
          _model.findOne(cond).exec()
          .then(function(_item){
            if(!_item){
              hasData = false;
              return cb();
            }
            membership = _item;
            let expired_time = getDateBeginTS(_item.validAt) + validTS - 1;
           /* let expired_time_1 = getDateBeginTS(_item.validAt) + validTS_1 - 1;
            let expired_time_2 = getDateBeginTS(_item.validAt) + validTS_2 - 1;
            if(_item.cardNo == '2017050300000'){
              expired_time = expired_time_2;
            }else{
              expired_time = expired_time_1;
            }*/
            return _model.update({_id: _item._id}, {$set: {expiredAt: expired_time}}).exec();
          })
          .then(function(_res){
            if(!_res || _res.nModified != 1){
              errArray.push(membership._id + '');
            }
            //console.log(_res);
            cb();
          }, function(err){
            console.log(err);
            cb();
          })
        },
        function () {
          console.log('all has completed!', errArray.toString(','));
        }
      );
     return 'beginning.....' + min_expired_time;
    })
    return this.success(promise_res);
  }
}