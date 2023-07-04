/**
 *
 * 送药上门
 *
 * Created by yichen on 2018/5/15.
 */
'user strict';
let drug_delivery_service = Backend.service('drugActivity','drug_delivery');
  _ = require('underscore'),
  co = require('co');


module.exports = {
  __rule: function (valid) {
    return valid.object({
      pageNum: valid.number().required(),
    });
  },
  mockAction: function () {
    let resObj = {
      code: '200',
      msg: '',
      items: [
        {
          _id:	'5a054e1620093e6b5437a0f0',
          channelName	:'保健药',
          address	:'北京市朝阳区中海广场',
          phoneNum	:'18801279241',
          image	:'00003F61-A241-4B2D-8F3E-5CEE952D3875',
          distance : 0.8
        }
      ]
    };
    return this.success(resObj);
  },

  getAction: function () {
    let self = this;
    let query = self.req.query;
    let result = co(function* () {
      return yield drug_delivery_service.list_by_location(query.location,query.pageSize,query.pageNum,query.type,query.name);
    }).catch(function (err) {
      console.log(err);
    })
    return this.success(result)
  }
};
