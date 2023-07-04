'use strict';
const user_factory_amount_model = Backend.model('user_group', undefined, 'userFactoryAmount');
const reimburse_model = require('../../../app/models/Reimburse');
const factory_model = require('../../../app/models/Factory');
const co = require('co');
const _ = require('underscore');

module.exports = {
  __beforeAction: function () {
    console.log('当前的环境', process.env.NODE_ENV);
    if (process.env.NODE_ENV != '_test') {
      let ip = getClientIp(this.req);
      let whiteIP = ['127.0.0.1'];//123.56.147.196 正式公网 182.92.106.199 测试公网
      console.log('请求的ip地址', ip);
      if (whiteIP.indexOf(ip) == -1) {
        return this.fail("必须白名单内的IP才可以访问");
      }
    }
  },
  getAction(){
    co(function* (){
      let bookmark = Date.now();
      const cond = {
        isDeleted: false,
        checkStatus: 1,
        createdAt: {$lt: bookmark}
      };
      const fields = 'user factoryCode reimbursePrice reimburseCount createdAt';
      let hasMore = true;
      while(hasMore){
        cond.createdAt = {$lt: bookmark};
        let reimburses = yield reimburse_model.find(cond, fields, {limit: 1000, sort: {createdAt: -1}}).exec();
        if(reimburses && reimburses.length == 0){
          console.log('over!');
          return hasMore = false;
        }
        bookmark = reimburses[reimburses.length -1].createdAt;
        console.log('bookmark:', bookmark);
        const factoryCodes = [];
        for(let i=0; i<reimburses.length; i++){
          let reimburse = reimburses[i];
          if(factoryCodes.indexOf(reimburse.factoryCode) == -1){
            factoryCodes.push(reimburse.factoryCode);
          }
        }
        const factories = yield factory_model.find({code: {$in: factoryCodes}}, '_id code');
        const code_factory_map = _.indexBy(factories, 'code');
        for(let i=0; i<reimburses.length; i++){
          let reimburse = reimburses[i];
          let current_cond = {
            user: reimburse.user,
            factory: code_factory_map[reimburse.factoryCode]._id,
          };
          const amount = yield user_factory_amount_model.findOne(current_cond).exec();
          const value = Number(
            (reimburse.reimbursePrice * reimburse.reimburseCount).toFixed(2)
          );
          if(!amount){
            current_cond.amount = value;
            yield user_factory_amount_model.create(current_cond);
          }else{
            yield user_factory_amount_model.update(current_cond, {$inc: {amount: value}});
          }
        }
      }
    });
    return this.success('beginning.......');
  }
};